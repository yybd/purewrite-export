// Copies PureWrite's export engine into vendor/purewrite/, file for file, so
// the plugin runs the same code the app runs — and builds without the app.
//
//   PUREWRITE=<PureWrite repo> node scripts/sync-engine.mjs           copy
//   PUREWRITE=<PureWrite repo> node scripts/sync-engine.mjs --check   fail if vendor/ differs
//
// Never edit vendor/ by hand: a fix belongs in PureWrite, then a sync.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const source = process.env.PUREWRITE;
if (!source || !existsSync(join(source, 'src/services/export/engine.ts'))) {
    console.error('Set PUREWRITE to the PureWrite repository.');
    process.exit(1);
}
const check = process.argv.includes('--check');
const target = 'vendor/purewrite';

const EXPORT = ['engine', 'book', 'docx', 'epub', 'html', 'direction', 'templates', 'zip'];
const files = [
    ...EXPORT.map((n) => `src/services/export/${n}.ts`),
    ...readdirSync(join(source, 'src/extensions'))
        .filter((n) => n.endsWith('.ts') && !n.endsWith('.test.ts'))
        .map((n) => `src/extensions/${n}`),
];

const commit = execFileSync('git', ['-C', source, 'rev-parse', '--short', 'HEAD']).toString().trim();
const stamp = `PureWrite ${commit}\n${files.join('\n')}\n`;

if (check) {
    const stale = files.filter((f) => {
        const mine = join(target, f);
        return !existsSync(mine) || readFileSync(mine, 'utf8') !== readFileSync(join(source, f), 'utf8');
    });
    if (stale.length) {
        console.error(`vendor/ differs from PureWrite ${commit}:\n  ${stale.join('\n  ')}\nRun: node scripts/sync-engine.mjs`);
        process.exit(1);
    }
    console.log(`vendor/ matches PureWrite ${commit}.`);
} else {
    rmSync(target, { recursive: true, force: true });
    for (const f of files) {
        mkdirSync(dirname(join(target, f)), { recursive: true });
        writeFileSync(join(target, f), readFileSync(join(source, f)));
    }
    writeFileSync(join(target, 'SOURCE'), stamp);
    console.log(`Copied ${files.length} files from PureWrite ${commit}.`);
}
