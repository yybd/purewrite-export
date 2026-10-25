// The rules Obsidian's directory review runs (eslint-plugin-obsidianmd's
// recommended set). vendor/ is PureWrite's engine, linted in PureWrite.
import { defineConfig } from 'eslint/config';
import obsidianmd from 'eslint-plugin-obsidianmd';

export default defineConfig([
    { ignores: ['main.js', 'node_modules/', 'scripts/', 'esbuild.config.mjs', '**/*.test.ts'] },
    ...obsidianmd.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: { allowDefaultProject: ['eslint.config.*'] },
            },
        },
    },
]);
