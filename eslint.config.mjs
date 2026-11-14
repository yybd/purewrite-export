// The rules Obsidian's directory review runs (eslint-plugin-obsidianmd's
// recommended set). vendor/ is PureWrite's engine, linted in PureWrite too —
// but the review scans it here, and fails a release on Obsidian's own rules
// there (0.4.1 and 0.4.2 failed on vendor files), so it is linted here as
// the review does: Obsidian's rules as errors, the type rules it reports
// only as warnings.
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
    {
        files: ['vendor/**/*.ts'],
        rules: {
            '@typescript-eslint/no-base-to-string': 'warn',
            '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
        },
    },
]);
