# Changelog

The release notes of each version; the tag's message is the version's section.

## Unreleased

- Formulas reach Word as real equations, editable in Word: fractions, roots, sub- and
  superscripts, sums and integrals with their limits, accents, and matrices and
  `\left…\right` in brackets that grow with them. In EPUB,
  PDF and HTML they are MathML. A formula KaTeX cannot read stays as its TeX.
- Mermaid diagrams are exported as pictures, drawn by Obsidian's own mermaid at twice
  their size for a sharp print, in Word, PDF, EPUB and HTML. A diagram mermaid cannot
  draw stays as its code.
- A `<details>` block is exported open, under its summary in bold.
- New format: HTML — the note or the folder as one web page, images inside it.
- PureWrite's engine at 1c5c02c: link definitions are left out and links keep their
  URL, and a block of raw HTML is kept as its source.
