import js from '@eslint/js';
// eslint-disable-next-line import/no-unresolved
import typescriptEslint from '@typescript-eslint/eslint-plugin';
// eslint-disable-next-line import/no-unresolved
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import yml from 'eslint-plugin-yml';
import globals from 'globals';
import yamlParser from 'yaml-eslint-parser';

const ignorePatterns = {
  // this becomes a global ignore pattern since the `files` key is not specified
  ignores: ['**/*.d.ts', '**/node_modules', '**/dist'],
};

const baseConfig = {
  plugins: {
    'simple-import-sort': simpleImportSort,
    import: _import,
  },
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.vitest,
      globalThis: 'readonly',
    },
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.json', '.ts', '.tsx', 'd.ts'],
      },
    },
  },
  rules: {
    'id-length': ['warn', { min: 2, exceptions: ['_', 'i', 'j'] }],
    'prefer-object-spread': 'warn',
    'sort-imports': 'off',
    curly: ['error', 'all'],
    'simple-import-sort/imports': 'error',
    'import/order': 'off',
    'import/no-extraneous-dependencies': 'error',
    'import/no-unresolved': [
      2,
      {
        caseSensitiveStrict: true,
      },
    ],
    'no-restricted-exports': [
      'warn',
      {
        restrictDefaultExports: {
          direct: true,
          named: true,
          defaultFrom: true,
          namedFrom: true,
          namespaceFrom: true,
        },
      },
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
};

const typeScriptConfig = {
  files: ['**/*.ts', '**/*.tsx'],
  plugins: {
    '@typescript-eslint': typescriptEslint,
  },
  languageOptions: {
    parser: tsParser,
  },
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-redeclare': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-redeclare': [
      'error',
      {
        ignoreDeclarationMerge: true,
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TSEnumDeclaration:not([const=true])',
        message: "Don't declare non-const enums",
      },
    ],
  },
};

const yamlConfig = {
  files: ['**/*.yaml', '**/*.yml'],
  plugins: {
    yml,
  },
  languageOptions: {
    parser: yamlParser,
  },
  rules: {
    'yml/quotes': [
      'error',
      {
        prefer: 'single',
      },
    ],
    'yml/plain-scalar': 'off',
  },
};

const configFilesOverride = {
  files: ['**/*.config.js', '**/*.config.ts', 'eslint.config.mjs'],
  rules: {
    'no-restricted-exports': ['off'],
  },
};

export default [
  ignorePatterns,
  js.configs.recommended,
  baseConfig,
  typeScriptConfig,
  yamlConfig,
  configFilesOverride,
];
