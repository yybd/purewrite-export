// The built main.js must load on every device Obsidian runs on. A regex
// lookbehind — (?<= or (?<! — is a syntax error on iOS before 16.4, and one
// anywhere in the bundle keeps the whole plugin from loading there. The
// directory's lint rule catches only (?<= in a regex literal, so the bundle
// itself is checked, dependencies included.
import { readFileSync } from 'node:fs';

const bundle = readFileSync('main.js', 'utf8');
const found = [...bundle.matchAll(/\(\?<[=!]/g)].map((m) => bundle.slice(Math.max(0, m.index - 40), m.index + 30));
if (found.length) {
    console.error(`main.js has ${found.length} regex lookbehind(s), which iOS before 16.4 cannot parse:\n  ${found.join('\n  ')}`);
    process.exit(1);
}
console.log('main.js: no regex lookbehind.');
