import path from 'path';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { fileURLToPath } from 'url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(___filename);

const config: StorybookConfig = {
  stories: [
    {
      directory: '../src/story-book',
      titlePrefix: 'Components',
      files: '**/*.stories.@(ts|tsx)',
    },
    {
      directory: '../src/components_codex',
      titlePrefix: 'Components Codex',
      files: '**/*.stories.@(ts|tsx)',
    },
    {
      directory: '../src/components_claude',
      titlePrefix: 'Components Claude',
      files: '**/*.stories.@(ts|tsx)',
    },
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (baseConfig) =>
    mergeConfig(baseConfig, {
      define: { 'process.env': {} },
      resolve: {
        alias: [
          {
            find: '@/components',
            replacement: path.resolve(___dirname, '../src/components_codex'),
          },
          {
            find: '@/components_claude',
            replacement: path.resolve(___dirname, '../src/components_claude'),
          },
          { find: '@/mocks', replacement: path.resolve(___dirname, '../src/mocks') },
          { find: '@/lib', replacement: path.resolve(___dirname, '../src/lib') },
          { find: '@/utils', replacement: path.resolve(___dirname, '../src/utils') },
          { find: '@story-book', replacement: path.resolve(___dirname, '../src/story-book') },
          {
            find: '@components_codex',
            replacement: path.resolve(___dirname, '../src/components_codex'),
          },
          {
            find: '@components_claude',
            replacement: path.resolve(___dirname, '../src/components_claude'),
          },
          { find: '@components', replacement: path.resolve(___dirname, '../src/components') },
          { find: '@', replacement: path.resolve(___dirname, '../src') },
          {
            find: '@sitecore-content-sdk/nextjs',
            replacement: path.resolve(___dirname, '../src/mocks/sitecore-content-sdk.mock.tsx'),
          },
          { find: 'next/image', replacement: path.resolve(___dirname, './next-image-mock.tsx') },
        ],
      },
      css: {
        preprocessorOptions: {
          scss: { api: 'modern-compiler' },
          sass: { api: 'modern-compiler' },
        },
      },
    }),
};

export default config;
