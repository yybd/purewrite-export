import { loadMermaid } from 'obsidian';
import type { ExportImage } from '../vendor/purewrite/src/services/export/engine';

/**
 * A mermaid diagram as a picture, drawn by Obsidian's own mermaid: light,
 * with labels in SVG text (an HTML label is a foreignObject, which makes
 * the canvas refuse the drawing), and rasterized at twice its size so it
 * prints sharp. As in PureOpen's Word export (wordExport.ts).
 */

interface Mermaid {
    render(id: string, source: string): Promise<{ svg: string }>;
}

let seq = 0;

/**
 * Mermaid's SVG with a size of its own: it comes as width="100%" with the
 * real width in a max-width style, and as an image it needs pixels.
 */
export function sizedSvg(svg: string): string {
    return svg.replace(/<svg\b[^>]*>/, (tag) => {
        const max = tag.match(/max-width:\s*([\d.]+)px/)?.[1];
        const box = tag.match(/viewBox="[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)"/);
        const width = max ?? box?.[1];
        if (!width) return tag;
        const height = box ? (Number(box[2]) * Number(width)) / Number(box[1]) : null;
        const bare = tag.replace(/\s(width|height)="[^"]*"/g, '').replace(/\sstyle="[^"]*"/, '');
        return bare.replace(/^<svg/, `<svg width="${width}"${height ? ` height="${height}"` : ''}`);
    });
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('The diagram could not be drawn'));
        img.src = url;
    });
}

const SCALE = 2;

/** The diagram as a PNG at its own size, drawn at twice it; null if mermaid cannot draw it. */
export async function diagramImage(source: string): Promise<ExportImage | null> {
    const id = `pwx-mermaid-${++seq}`;
    try {
        const mermaid = (await loadMermaid()) as Mermaid;
        const init = '%%{init: {"theme": "default", "htmlLabels": false, "flowchart": {"htmlLabels": false}}}%%';
        const { svg } = await mermaid.render(id, `${init}\n${source}`);
        const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sizedSvg(svg))}`);
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        if (!width || !height) return null;
        const canvas = createEl('canvas');
        canvas.width = Math.round(width * SCALE);
        canvas.height = Math.round(height * SCALE);
        const g = canvas.getContext('2d');
        if (!g) return null;
        g.fillStyle = '#fff';
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.drawImage(img, 0, 0, canvas.width, canvas.height);
        const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!png) return null;
        return { data: new Uint8Array(await png.arrayBuffer()), type: 'png', width, height };
    } catch {
        return null;
    } finally {
        // What mermaid may leave behind in the page when it fails.
        document.getElementById(`d${id}`)?.remove();
        document.getElementById(id)?.remove();
    }
}
