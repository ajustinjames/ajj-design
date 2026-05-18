import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../packages/*/stories/**/*.stories.ts'],
  addons: [],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
};

export default config;
