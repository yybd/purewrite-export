// Copies PureWrite's export engine into vendor/purewrite/, file for file, so
// the plugin runs the same code the app runs — and builds without the app.
//
//   PUREWRITE=<PureWrite repo> node scripts/sync-engine.mjs           copy
//   PUREWRITE=<PureWrite repo> node scripts/sync-engine.mjs --check   fail if vendor/ differs
//   node scripts/sync-engine.mjs --check                              no PureWrite here: pass
//
// Never edit vendor/ by hand: a fix belongs in PureWrite, then a sync.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const source = process.env.PUREWRITE;
const check = process.argv.includes('--check');
if (!source || !existsSync(join(source, 'src/services/export/engine.ts'))) {
    // Without the app there is nothing to compare against: the committed
    // vendor/ is the engine, and the build uses it as it is.
    if (check) {
        console.log(`PUREWRITE not set: building with vendor/ as committed (${readFileSync(join('vendor/purewrite', 'SOURCE'), 'utf8').split('\n')[0]}).`);
        process.exit(0);
    }
    console.error('Set PUREWRITE to the PureWrite repository.');
    process.exit(1);
}
const target = 'vendor/purewrite';

// The engine's entry points, and every PureWrite file they import, followed
// import by import — a fixed list fell behind the app whenever the engine
// began to import a new file.
const ENTRIES = ['src/services/export/engine.ts', 'src/services/export/book.ts'];
const IMPORT = /(?:import|export)\s[^;]*?from\s+['"](\.[^'"]+)['"]/g;
const files = [];
const queue = [...ENTRIES];
while (queue.length) {
    const file = queue.shift();
    if (files.includes(file)) continue;
    files.push(file);
    for (const m of readFileSync(join(source, file), 'utf8').matchAll(IMPORT)) {
        const base = join(dirname(file), m[1]);
        const found = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, base].find(
            (c) => existsSync(join(source, c)) && statSync(join(source, c)).isFile(),
        );
        if (!found) throw new Error(`${file}: cannot find ${m[1]}`);
        queue.push(found);
    }
}
files.sort();

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
