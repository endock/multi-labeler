import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    ignores: ['dist/**', 'lib/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // io-ts declares a const and a type of the same name on purpose, tsc catches real redeclarations
      'no-redeclare': 'off',
      // tsc resolves identifiers, eslint would only guess at globals and ambient types
      'no-undef': 'off',
    },
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'import-x': importX,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
    },
  },
  {
    plugins: {
      'no-only-tests': noOnlyTests,
    },
    rules: {
      'no-only-tests/no-only-tests': 'error',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier,
];
