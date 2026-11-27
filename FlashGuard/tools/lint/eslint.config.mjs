
// ESLint configuration for FlashGuard QA tests
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  {
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
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      eqeqeq: ['error', 'always'],
    },
  },

  {
    files: ['tests/mobile/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/e2e/**/*.spec.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/no-focused-test': 'error',
      'playwright/no-standalone-expect': 'warn',
    },
  },
);
