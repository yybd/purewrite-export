# PureWrite Export

Book-ready Word and EPUB from a note or a whole folder — real footnotes, tables,
lists, images and chapter breaks, with Hebrew and English set correctly side by side.
Works on desktop, iPhone and iPad, with nothing to install. Free.

## Use

- **A folder:** right-click it → *Export as a book (Word / EPUB)*, or run *Export the
  current note's folder as a book*. Every note in it and its subfolders becomes a
  chapter.
- **A note:** right-click it → *Export as Word / EPUB*, or *Export the current note*.

The file is written into the vault, beside what it was made from. Nothing leaves
the device.

**Chapter order** is by name (number your notes 01, 02, …), unless the folder holds an
order saved by PureWrite (below). **Obsidian syntax** is read as Reading view shows
it: image embeds become images, wikilinks their text, callouts quotes with a bold
title; front matter, `%%comments%%` and block ids are left out.

## The engine, and PureWrite

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
PUREWRITE=<path to PureWrite> pnpm sync-engine   # copy the engine again
pnpm build                                       # fails if vendor/ is stale
pnpm test
```
