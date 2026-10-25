import esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { fileURLToPath } from 'node:url';

const production = process.argv[2] === 'production';

// `import x from 'pagedjs-standalone?raw'` — paged.js's built file as a
// string, as PureWrite imports it through Vite (its exports map does not list
// the dist file, so it is named here).
const rawPagedJs = {
    name: 'raw-pagedjs',
    setup(build) {
        build.onResolve({ filter: /^pagedjs-standalone\?raw$/ }, () => ({
            path: fileURLToPath(new URL('./node_modules/pagedjs/dist/paged.min.js', import.meta.url)),
            namespace: 'raw',
        }));
        build.onLoad({ filter: /.*/, namespace: 'raw' }, async (args) => ({
            contents: await readFile(args.path, 'utf8'),
            loader: 'text',
        }));
    },
};

const context = await esbuild.context({
    entryPoints: ['src/main.ts'],
    bundle: true,
    external: ['obsidian', 'electron', '@codemirror/*', '@lezer/*', ...builtinModules],
    format: 'cjs',
    target: 'es2020',
    logLevel: 'info',
    sourcemap: production ? false : 'inline',
    treeShaking: true,
    minify: production,
    outfile: 'main.js',
    plugins: [rawPagedJs],
});

if (production) {
    await context.rebuild();
    process.exit(0);
} else {
    await context.watch();
}
