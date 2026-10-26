# PureWrite Export

Book-ready Word, PDF and EPUB from a note or a whole folder — real footnotes, tables,
lists, images and chapter breaks, with Hebrew and English set correctly side by side.
Works on desktop and on phones and tablets (PDF on desktop). Free.

**What sets it apart**

- **No Pandoc, no LaTeX, nothing to install.** The Word (DOCX), PDF and EPUB writers are
  inside the plugin, so it works offline and on mobile.
- **Right-to-left (RTL) done properly.** Hebrew and Arabic paragraphs get their own
  direction, page side and alignment, line by line, and English stays left-to-right beside
  them, in Word, PDF and EPUB alike.
- **A folder becomes a book.** Every note is a chapter, in your order, each one optionally
  starting a new page, with real Word footnotes and a first-line indent, as in a book.

## Use

- **A folder:** right-click it → *Export as a book (Word / PDF / EPUB)*, or run *Export the
  current note's folder as a book*. Every note in it and its subfolders becomes a
  chapter.
- **A note:** right-click it → *Export as Word / PDF / EPUB*, or *Export the current note*.

The file is written into the vault, beside what it was made from, and the dialog
offers to open it. Nothing leaves the device. A PDF is laid out with PureWrite's
own print layout (paged.js) and printed by Obsidian's Chromium, so it is made on
the desktop only; a phone offers Word and EPUB. The dialog speaks Hebrew when
Obsidian does.

**Chapter order** is by name (number your notes 01, 02, …), unless the folder holds an
order saved by PureWrite (below). **Obsidian syntax** is read as Reading view shows
it: image embeds become images, wikilinks their text, callouts quotes with a bold
title; front matter, `%%comments%%` and block ids are left out.

## Install

From Obsidian: *Settings → Community plugins → Browse*, search for **PureWrite Export**.
By hand: copy `main.js`, `manifest.json` and `styles.css` from the latest
[release](../../releases/latest) into `<vault>/.obsidian/plugins/purewrite-export/`.

## The engine, and PureWrite

> **Disclosure:** after an export, the result screen shows a small card about
> PureWrite, the author's own app, with a link to its page. It appears only
> there, after an export you started — never as a pop-up or a notice — and
> nothing is loaded from the internet to show it.

The export is built by the export engine of [PureWrite](https://puretext.bdtech.app/purewrite),
a focused Markdown writer for Mac, iPhone and iPad, sold separately on the App Store.
This plugin is free and needs no PureWrite.

If you do use both, they are one tool over one folder: a folder exported here and in
PureWrite is the same document, and the folder remembers its settings in
`.purewrite-book.json` — the title, the switches, and the chapter order you drag into
place in PureWrite's sidebar. Each export starts where the last one left off,
whichever app made it.

## Development

`vendor/purewrite/` is PureWrite's engine, copied file for file — never edit it here.

```bash
pnpm install
pnpm build       # builds main.js from the committed vendor/, linted with Obsidian's rules
pnpm test
```

Updating the engine needs the PureWrite repository, which is not public:

```bash
PUREWRITE=<path to PureWrite> pnpm sync-engine   # copy the engine again
PUREWRITE=<path to PureWrite> pnpm build         # fails if vendor/ is stale
```

## Releasing

Bump `version` in `manifest.json` and `package.json`, add it to `versions.json`,
commit, then push an annotated tag with that version and the release notes as its
message (`git tag -a 0.2.3 -m "…"`). The Release workflow builds, attests the files
and publishes them.

## License

MIT — see [LICENSE](LICENSE). That covers this repository, the engine in
`vendor/purewrite/` included; it does not cover the PureWrite app.
