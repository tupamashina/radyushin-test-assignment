// @ts-check

import {
  antfu,
  defaultPluginRenaming,
  renameRules,
} from '@antfu/eslint-config';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslintJs from '@eslint/js';
import reactPlugin from '@eslint-react/eslint-plugin';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import-x';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPluginRecommendedConfig from 'eslint-plugin-prettier/recommended';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';

const flatCompat = new FlatCompat();

const configComposer = antfu({
  gitignore: { root: true },
  typescript: { tsconfigPath: 'tsconfig.json' },
  react: true,

  test: false,
  toml: false,
  yaml: false,
  jsonc: false,
  markdown: false,
  stylistic: false,
});

//* ============================= Plugin renaming ==============================

/**
 * @typedef {typeof defaultPluginRenaming} DPR
 * @type {Record<string, string> & { [N in keyof DPR]: DPR[N] }}
 */
const pluginRenaming = {
  n: defaultPluginRenaming.n,
  yml: defaultPluginRenaming.yml,
  vitest: defaultPluginRenaming.vitest,
  'import-x': defaultPluginRenaming['import-x'],
  '@stylistic': defaultPluginRenaming['@stylistic'],
  '@typescript-eslint': defaultPluginRenaming['@typescript-eslint'],

  '@eslint-react/debug': 'react-debug',
  '@eslint-react/web-api': 'react-web-api',
  '@eslint-react/dom': defaultPluginRenaming['@eslint-react/dom'],

  '@eslint-react/hooks-extra':
    defaultPluginRenaming['@eslint-react/hooks-extra'],

  '@eslint-react/naming-convention':
    defaultPluginRenaming['@eslint-react/naming-convention'],

  '@eslint-react': defaultPluginRenaming['@eslint-react'],
};

void configComposer.renamePlugins(pluginRenaming);

//* ================================ JavaScript ================================

void configComposer.override('antfu/javascript/setup', {
  languageOptions: {
    ecmaVersion: 'latest',
    parserOptions: { ecmaVersion: 'latest' },
    globals: { ...globals.browser, ...globals.es2025, ...globals.node },
  },
});

void configComposer.insertBefore('antfu/javascript/rules', {
  name: 'eslint/recommended',
  ...eslintJs.configs.recommended,
});

//* ================================ TypeScript ================================

void configComposer.insertBefore(
  'antfu/typescript/rules',
  {
    name: 'typescript/strict-type-checked',
    rules: tsPlugin.configs['strict-type-checked']?.rules,
  },
  {
    name: 'typescript/stylistic-type-checked',
    rules: tsPlugin.configs['stylistic-type-checked']?.rules,
  },
);

//* =================================== Node ===================================

void configComposer.insertAfter('antfu/node/rules', {
  name: 'node/rules',

  rules: {
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
  },
});

//* ================================= Imports ==================================

const tsExtensions = ['.ts', '.cts', '.mts', '.tsx'];
const allExtensions = [...tsExtensions, '.js', '.cjs', '.mjs', '.jsx'];

void configComposer.insertBefore(
  'antfu/imports/rules',
  {
    name: 'imports/setup',

    settings: {
      'import-x/extensions': allExtensions,
      'import-x/parsers': { '@typescript-eslint/parser': tsExtensions },

      'import-x/resolver': {
        node: { extensions: allExtensions },
        typescript: { alwaysTryTypes: true },
      },

      'import-x/external-module-folders': [
        'node_modules',
        'node_modules/@types',
      ],
    },
  },
  {
    name: 'imports/recommended',
    rules: importPlugin.configs.recommended.rules,
  },
  {
    name: 'imports/typescript',
    rules: importPlugin.configs.typescript.rules,
  },
);

const ROOT_NEXT_FILES = ['robots', 'manifest', 'global-error'];

const NESTED_NEXT_FILES = [
  'default',
  'error',
  'layout',
  'loading',
  'not-found',
  'page',
  'template',
  'icon',
  'apple-icon',
  'opengraph-image',
  'twitter-image',
  'sitemap',
];

void configComposer.insertAfter(
  'antfu/imports/rules',
  {
    name: 'imports/rules',

    rules: {
      'import/default': 'off',
      'import/export': 'off',
      'import/first': 'warn',
      'import/namespace': 'off',
      'import/newline-after-import': ['warn', { considerComments: true }],
      'import/no-anonymous-default-export': 'warn',
      'import/no-default-export': 'warn',
      'import/no-deprecated': 'warn',
      'import/no-named-default': 'warn',
      'import/no-unresolved': 'off',

      'import/order': [
        'warn',
        {
          distinctGroup: false,
          'newlines-between': 'always',
          alphabetize: { order: 'asc', orderImportKind: 'asc' },

          groups: [
            ['builtin', 'external', 'internal'],
            ['index', 'sibling', 'parent'],
            ['type', 'unknown'],
          ],

          pathGroups: [
            { pattern: '~/**', group: 'parent', position: 'before' },
            { pattern: '../**', group: 'parent', position: 'before' },
            { pattern: './**', group: 'sibling', position: 'after' },
          ],
        },
      ],
    },
  },
  {
    name: 'imports/overrides/next',

    files: [
      'next.config.ts',
      `src/app/@(${ROOT_NEXT_FILES.join('|')}).?([cm])[jt]s?(x)`,
      `src/app/**/@(${NESTED_NEXT_FILES.join('|')}).?([cm])[jt]s?(x)`,
    ],

    rules: { 'import/no-default-export': 'off' },
  },
);

//* ================================== React ===================================

const reactPluginRecommendedTypeCheckedConfig =
  reactPlugin.configs['recommended-type-checked'];

void configComposer.insertBefore('antfu/react/rules', {
  name: 'react/recommended-type-checked',
  ...reactPluginRecommendedTypeCheckedConfig,

  rules: renameRules(
    reactPluginRecommendedTypeCheckedConfig.rules,
    pluginRenaming,
  ),
});

void configComposer.insertAfter('antfu/react/rules', {
  name: 'react/rules',

  rules: {
    'react-refresh/only-export-components': [
      'warn',
      {
        allowExportNames: [
          'experimental_ppr',
          'dynamic',
          'dynamicParams',
          'revalidate',
          'fetchCache',
          'runtime',
          'preferredRegion',
          'maxDuration',
          'generateImageMetadata',
          'metadata',
          'generateMetadata',
          'sitemap',
          'generateSitemap',
          'generateStaticParams',
          'viewport',
          'generateViewport',
        ],
      },
    ],
  },
});

//* ================================= JSX a11y =================================

void configComposer.insertAfter('react/rules', {
  name: 'jsx-a11y/recommended',
  ...jsxA11yPlugin.flatConfigs.recommended,
});

//* =================================== Next ===================================

const [nextPluginRecommendedConfig, nextPluginCoreWebVitalsConfig] =
  fixupConfigRules(flatCompat.extends('plugin:@next/next/core-web-vitals'));

void configComposer.insertAfter(
  'jsx-a11y/recommended',
  { name: 'next/recommended', ...nextPluginRecommendedConfig },
  { name: 'next/core-web-vitals', ...nextPluginCoreWebVitalsConfig },
);

//* ================================= Unicorn ==================================

void configComposer.insertBefore('antfu/unicorn/rules', {
  name: 'unicorn/recommended',
  rules: unicornPlugin.configs['flat/recommended'].rules,
});

//* ================================= Comments =================================

void configComposer.insertAfter('antfu/eslint-comments/rules', {
  name: 'eslint-comments/rules',

  rules: {
    'eslint-comments/disable-enable-pair': ['warn', { allowWholeFile: true }],
    'eslint-comments/no-aggregating-enable': 'warn',
    'eslint-comments/no-duplicate-disable': 'warn',
    'eslint-comments/no-unused-enable': 'warn',

    'eslint-comments/no-use': [
      'warn',
      {
        allow: [
          'eslint-disable',
          'eslint-disable-line',
          'eslint-disable-next-line',
          'eslint-enable',
        ],
      },
    ],

    'eslint-comments/require-description': 'warn',
  },
});

//* ============================== Perfectionist ===============================

void configComposer.insertAfter('antfu/perfectionist/setup', {
  name: 'perfectionist/rules',

  rules: {
    'perfectionist/sort-exports': 'off',
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-exports': 'off',

    'perfectionist/sort-named-imports': [
      'warn',
      { type: 'natural', groupKind: 'values-first' },
    ],
  },
});

//* ================================= Prettier =================================

void configComposer.append(
  { name: 'prettier/recommended', ...prettierPluginRecommendedConfig },
  { name: 'prettier/rules', rules: { 'prettier/prettier': 'warn' } },
);

//* ================================== Export ==================================

export default configComposer;
