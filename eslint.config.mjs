import nextOnPages from 'eslint-plugin-next-on-pages';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import json from 'eslint-plugin-json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = [...compat.extends(
  'next/core-web-vitals',
  'next/typescript',
  'eslint:recommended',
  'plugin:json/recommended-legacy',
  'plugin:@typescript-eslint/recommended',
  'plugin:next-on-pages/recommended',
  'plugin:tailwindcss/recommended',
), {
  plugins: {
    'next-on-pages': nextOnPages,
    'json': json,
  },
}, {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],

  languageOptions: {
    parser: tsParser,
  },

  rules: {
    quotes: ['error', 'single'],
    indent: ['error', 2],
    'comma-dangle': ['error', 'always-multiline'],
  },
}];

export default eslintConfig;