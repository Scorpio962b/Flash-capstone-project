// npm i -D eslint @eslint/js typescript-eslint eslint-plugin-playwright
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
    // Only the QA code is linted. The app itself (mobile\, web\) is not part of this project's lint gate.
    ignores: [
      'mobile/**', 'web/**', '**/node_modules/**', '**/dist/**', '**/.idea/**',
      'playwright-report/**', 'test-results/**', 'allure-results/**', 'allure-report/**',
      'reports/**', 'results/**', '.features-gen/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      eqeqeq: ['error', 'always'],
      'no-debugger': 'error',
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Plain JS test files (tests\mobile\Separate, tests\mobile\mkdir specs) use globals like driver, $, describe, require
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/e2e/**/*.spec.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-focused-test': 'error',
    },
  },
);
