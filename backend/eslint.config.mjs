// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Bỏ qua các thư mục không cần lint
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'node_modules/**',
      'webpack-hmr.config.js',
      'scripts/**',
    ],
  },

  // Các rule cơ bản của ESLint
  eslint.configs.recommended,

  // Các rule TypeScript có kiểm tra kiểu (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  // Tích hợp Prettier — phải để cuối cùng để override các rule format
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      // ── TypeScript ────────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',              // Cảnh báo khi dùng any
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',                               // Bỏ qua biến bắt đầu bằng _
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',        // Bắt buộc await Promise
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off', // Không bắt buộc khai báo return type
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'warn',          // Không khai báo kiểu thừa (vd: x: number = 1)

      // ── ESLint chung ─────────────────────────────────────────────────────
      'no-console': 'warn',                                      // Cảnh báo khi dùng console.log
      'no-debugger': 'error',                                    // Cấm debugger
      'no-duplicate-imports': 'error',                           // Cấm import trùng
      'eqeqeq': ['error', 'always'],                             // Bắt buộc === thay vì ==
      'prefer-const': 'error',                                   // Ưu tiên const
      'no-var': 'error',                                         // Cấm var

      // ── Prettier ─────────────────────────────────────────────────────────
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          semi: true,
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          bracketSpacing: true,
          arrowParens: 'always',
          endOfLine: 'lf',
        },
      ],
    },
  },
);
