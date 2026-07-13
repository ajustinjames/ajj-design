import type { Decorator, Preview } from '@storybook/web-components';

// Import every system's token CSS (light + dark tiers) without hand-maintaining
// a per-system list here. `scripts/create-system.sh` only needs to produce a
// `packages/<system>-tokens/dist/web/tokens.css` (+ `tokens-dark.css`) and
// this glob picks it up automatically as new systems are scaffolded.
import.meta.glob('../packages/*-tokens/dist/web/tokens.css', { eager: true });
import.meta.glob('../packages/*-tokens/dist/web/tokens-dark.css', { eager: true });

// Token CSS scopes the dark tier with `[data-theme="dark"]` on :root (and via
// prefers-color-scheme). Stamping the attribute on the document element lets
// every story - including ones that don't know about theming - pick up the
// dark tier when the toolbar toggle is set to "dark".
const withTheme: Decorator = (story, context) => {
  const theme = context.globals.theme ?? 'light';
  document.documentElement.setAttribute('data-theme', theme);
  return story();
};

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'paper',
      values: [
        { name: 'paper', value: '#F0F0EC' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'glass', value: '#F5F5F7' },
        { name: 'ink', value: '#1A1A1A' },
        { name: 'dark-surface', value: '#222222' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
