import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-plugin-prettier/recommended';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettierConfig,
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vue.parser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        browser: true,
        es2021: true,
        node: true,
        process: 'readonly',
        console: 'readonly',
        Event: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLElement: 'readonly',
        window: 'readonly',
        DragEvent: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        navigator: 'readonly',
        MenuItem: 'readonly',
        FileReader: 'readonly',
        ConfigItem: 'readonly',
        ConfigGroup: 'readonly',
        document: 'readonly',
        UserInfo: 'readonly',
        ResponseData: 'readonly',
        localStorage: 'readonly',
        prompt: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      vue,
      prettier: prettierPlugin
    },
    rules: {
      'vue/no-redundant-element': 'off', // 开启冗余元素校验
      'vue/prefer-separate-semantic-elements': 'off', // 开启分离语义元素校验
      'prettier/prettier': 'warn', // 开启 prettier 校式化
      'vue/multi-word-component-names': 'off', // 开启多单词组件名校验
      'vue/no-v-html': 'off', // 开启 v-html 校验
      '@typescript-eslint/no-explicit-any': 'off', // 开启 any 类型校验
      '@typescript-eslint/no-unused-vars': [
        'warn', // 开启未使用变量校验
        {
          argsIgnorePattern: '^_', // 忽略 _ 开头的变量
          varsIgnorePattern: '^_' // 忽略 _ 开头的变量
        }
      ],
      '@typescript-eslint/no-non-null-assertion': 'off', // 开启非空断言校验
      'no-useless-assignment': 'off', // 开启无用赋值校验
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 开启 console 校验
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off' // 开启 debugger 校验
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        browser: true,
        es2021: true,
        node: true,
        process: 'readonly',
        console: 'readonly',
        Event: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLElement: 'readonly',
        window: 'readonly',
        DragEvent: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        navigator: 'readonly',
        MenuItem: 'readonly',
        FileReader: 'readonly',
        ConfigItem: 'readonly',
        ConfigGroup: 'readonly',
        document: 'readonly',
        UserInfo: 'readonly',
        ResponseData: 'readonly',
        localStorage: 'readonly',
        prompt: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'warn', // 开启 prettier 校式化
      '@typescript-eslint/no-explicit-any': 'off', // 开启 any 类型校验
      '@typescript-eslint/no-unused-vars': [
        'warn', // 开启未使用变量校验
        {
          argsIgnorePattern: '^_', // 忽略 _ 开头的变量
          varsIgnorePattern: '^_' // 忽略 _ 开头的变量
        }
      ],
      '@typescript-eslint/no-non-null-assertion': 'off', // 开启非空断言校验
      'no-useless-assignment': 'off', // 开启无用赋值校验
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 开启 console 校验
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off' // 开启 debugger 校验
    }
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'dist-ssr/**',
      '*.local',
      '.DS_Store',
      'coverage/**',
      '*.min.js',
      '*.min.css',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
      'vite.config.ts'
    ]
  }
];
