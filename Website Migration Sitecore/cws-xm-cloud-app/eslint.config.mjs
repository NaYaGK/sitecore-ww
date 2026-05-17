import eslintConfigNext from 'eslint-config-next';
import unicornPlugin from 'eslint-plugin-unicorn';

const componentFileGlobs = [
  'src/components/**/*.{ts,tsx}',
  'src/components_codex/**/*.{ts,tsx}',
  'src/components_claude/**/*.{ts,tsx}',
  'src/components/**/*.{ts,tsx}',
];

export default [
  {
    ignores: [
      '.next',
      'node_modules',
      'out',
      'storybook-static',
      'dist',
      '**/tsconfig.tsbuildinfo',
      'src/components_claude/**',
      'src/mocks/**',
      'src/assets/**',
    ],
  },
  ...eslintConfigNext,
  {
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: componentFileGlobs,
    plugins: {
      unicorn: unicornPlugin,
    },
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
];
