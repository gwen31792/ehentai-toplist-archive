import js from '@eslint/js'
import pluginNext from '@next/eslint-plugin-next'
import nx from '@nx/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import pluginImport from 'eslint-plugin-import'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/src/components/ui/**', // shadcn/ui 组件库
      '**/.nx/**',
      '**/.open-next/**',
      '**/.wrangler/**',
      '**/*.d.ts',
    ],
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  js.configs.recommended, // JavaScript 推荐规则
  ...tseslint.configs.recommended, // TypeScript 推荐规则
  // 通用语言选项与基础规则
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // React 配置
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react': pluginReact,
      'react-hooks': pluginReactHooks,
      '@next/next': pluginNext,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      // 关闭 React 17+ 不再需要的规则
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
  // Import 插件配置
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      import: pluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.base.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
        },
        node: true,
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      ...pluginImport.configs.recommended.rules,
      ...pluginImport.configs.typescript.rules,
      // Import 排序规则
      'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'pathGroups': [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          'pathGroupsExcludedImportTypes': ['react', 'next'],
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      // 确保命名导入存在于模块中
      'import/named': 'error',
      // 确保默认导出存在（React 19 不再有默认导出，所以设置为 warn）
      'import/default': 'off',
      // 确保命名空间导入正确
      'import/namespace': 'error',
      // 禁止重复导入
      'import/no-duplicates': 'error',
      // 禁止导入不存在的模块
      'import/no-unresolved': 'error',
    },
  },
  stylistic.configs.recommended, // 代码风格与格式化规则
]
