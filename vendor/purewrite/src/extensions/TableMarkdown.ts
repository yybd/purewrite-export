import Table from '@tiptap/extension-table';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

/**
 * GFM tables that survive a round-trip.
 *
 * tiptap-markdown already knows how to write a `table` node back out as a pipe
 * table, so registering the nodes is enough to make tables render and save.
 * Three things it does not carry, and this file adds:
 *
 * 1. Column alignment. `:---:` reaches the DOM as `style="text-align:center"`,
 *    which no default cell attribute reads, and the stock serializer always
 *    writes a plain `---` delimiter row. Left alone, merely touching a
 *    document would strip every alignment marker from its tables.
 * 2. Escaping of `|` inside a cell. Unescaped, one pipe in the text turns the
 *    row into extra columns the next time the file is parsed.
 * 3. A fallback for a table pipe syntax cannot express — merged cells or a
 *    multi-block cell, which only reach the document by pasting a table from
 *    a web page. tiptap-markdown falls back to writing the table as raw HTML;
 *    here that would be worse than the disease, because the editor parses
 *    markdown with `html: false` and would read its own output back as
 *    escaped `&lt;table&gt;` text. So the table is flattened to a pipe table
 *    instead: the merge structure is lost, the words are not.
 */

type Alignment = 'left' | 'center' | 'right' | null;

const ALIGNMENT_ATTRIBUTE = {
    alignment: {
        default: null as Alignment,
        parseHTML: (element: HTMLElement): Alignment => {
            const value = element.style.textAlign;
            return value === 'left' || value === 'center' || value === 'right' ? value : null;
        },
        renderHTML: (attributes: Record<string, any>) =>
            attributes.alignment ? { style: `text-align: ${attributes.alignment}` } : {},
    },
};

export const TableHeaderWithAlignment = TableHeader.extend({
    addAttributes() {
        return { ...this.parent?.(), ...ALIGNMENT_ATTRIBUTE };
    },
});

export const TableCellWithAlignment = TableCell.extend({
    addAttributes() {
        return { ...this.parent?.(), ...ALIGNMENT_ATTRIBUTE };
    },
});

function rowsOf(node: any): any[] {
    const rows: any[] = [];
    node.forEach((row: any) => rows.push(row));
    return rows;
}

function cellsOf(row: any): any[] {
    const cells: any[] = [];
    row.forEach((cell: any) => cells.push(cell));
    return cells;
}

/** The `---` / `:---:` line, taken from the header row's cells. */
function delimiterRow(headerCells: any[], columns: number): string {
    const marks = Array.from({ length: columns }, (_, i) => {
        const alignment: Alignment = headerCells[i]?.attrs.alignment ?? null;
        return alignment === 'center' ? ':---:'
            : alignment === 'left' ? ':---'
                : alignment === 'right' ? '---:'
                    : '---';
    });
    return `| ${marks.join(' | ')} |`;
}

/** True when the table is a plain grid that pipe syntax can express as-is. */
function isMarkdownSerializable(node: any): boolean {
    const [firstRow, ...bodyRows] = rowsOf(node);
    if (!firstRow) return false;

    // A pipe table is one line per row, so a cell has to be exactly one
    // paragraph — not two blocks, and not a list or a nested table, both of
    // which a cell accepts (`content: 'block+'`) and a pasted table can supply.
    const fitsOnOneLine = (cell: any) =>
        cell.attrs.colspan <= 1
        && cell.attrs.rowspan <= 1
        && cell.childCount === 1
        && cell.firstChild.isTextblock
        && cell.firstChild.type.name !== 'codeBlock';

    // The first row is the header row — without one there is no delimiter
    // line to write.
    return cellsOf(firstRow).every((cell) => cell.type.name === 'tableHeader' && fitsOnOneLine(cell))
        && bodyRows.every((row) => cellsOf(row).every(
            (cell) => cell.type.name !== 'tableHeader' && fitsOnOneLine(cell),
        ));
}

/** Cell text on a single line, safe to sit between two pipes. */
function flatCellText(cell: any): string {
    // textBetween, not textContent: the latter concatenates a multi-block
    // cell's paragraphs with nothing between them, gluing the last word of
    // one to the first of the next.
    return cell.textBetween(0, cell.content.size, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\|/g, '\\|')
        .trim();
}

/**
 * Last resort for a table pipe syntax can't express: one line per row, text
 * only. A merged cell writes its text once and pads the columns it spanned,
 * so the remaining cells stay under the right headers.
 */
function writeFlattenedTable(state: any, node: any) {
    const rows = rowsOf(node).map(cellsOf);
    const columns = Math.max(...rows.map(
        (cells) => cells.reduce((total: number, cell: any) => total + (cell.attrs.colspan || 1), 0),
    ));

    rows.forEach((cells, index) => {
        const texts: string[] = [];
        cells.forEach((cell: any) => {
            texts.push(flatCellText(cell));
            for (let i = 1; i < (cell.attrs.colspan || 1); i += 1) texts.push('');
        });
        while (texts.length < columns) texts.push('');
        state.write(`| ${texts.join(' | ')} |`);
        state.ensureNewLine();
        if (!index) {
            state.write(delimiterRow(cells, columns));
            state.ensureNewLine();
        }
    });
}

export const TableWithAlignment = Table.extend({
    addStorage() {
        return {
            ...this.parent?.(),
            markdown: {
                serialize(state: any, node: any) {
                    if (!isMarkdownSerializable(node)) {
                        writeFlattenedTable(state, node);
                        state.closeBlock(node);
                        return;
                    }

                    // A literal pipe in cell text would otherwise be read back
                    // as a column break.
                    const previousEscapes = state.options.escapeExtraCharacters;
                    state.options.escapeExtraCharacters = /\|/g;
                    state.inTable = true;

                    const rows = rowsOf(node);
                    rows.forEach((row, index) => {
                        const cells = cellsOf(row);
                        state.write('| ');
                        cells.forEach((cell, cellIndex) => {
                            if (cellIndex) state.write(' | ');
                            // An empty cell must still produce its column.
                            // fromBlockStart=false: a cell is not the start of a
                            // line, so "- 3" or "# 2" needs no escape there —
                            // with it, every save turned "-1" into "\-1".
                            if (cell.firstChild.textContent.trim()) {
                                state.renderInline(cell.firstChild, false);
                            }
                        });
                        state.write(' |');
                        state.ensureNewLine();
                        if (!index) {
                            state.write(delimiterRow(cells, cells.length));
                            state.ensureNewLine();
                        }
                    });

                    state.inTable = false;
                    state.options.escapeExtraCharacters = previousEscapes;
                    state.closeBlock(node);
                },
                parse: {
                    // handled by markdown-it
                },
            },
        };
    },
});
