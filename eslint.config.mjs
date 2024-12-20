import nextOnPages from 'eslint-plugin-next-on-pages';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

const eslintConfig = [...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:eslint-plugin-next-on-pages/recommended',
    'plugin:tailwindcss/recommended',
), {
    plugins: {
        'next-on-pages': nextOnPages,
    },
}, {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        quotes: ['error', 'single'],
    },
}];

export default eslintConfig;