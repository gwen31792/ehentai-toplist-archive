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
  'plugin:json/recommended-with-comments-legacy',
  'plugin:@typescript-eslint/recommended',
), {
  plugins: {
    'json': json,
  },
}, {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.json'],

  languageOptions: {
    parser: tsParser,
  },

  rules: {
    // quotes: ['error', 'single'],
    indent: ['error', 2],
    // 'comma-dangle': ['error', 'always-multiline'],
  },
}];

export default eslintConfig;

// 暂时不考虑切换到 flat config 精简现有的配置
// 有的插件，比如 eslint-plugin-next-on-pages，不提供直接可以用的 flat config
// 现在的配置还能用，就先不调整了