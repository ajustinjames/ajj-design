import '../packages/hardline-tokens/dist/web/tokens.css';
import '../packages/hardline-tokens/dist/web/tokens-dark.css';
import '../packages/glassline-tokens/dist/web/tokens.css';
import '../packages/glassline-tokens/dist/web/tokens-dark.css';
import type { Preview } from '@storybook/web-components';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'paper',
      values: [
        { name: 'paper', value: '#F0F0EC' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'glass', value: '#F5F5F7' },
      ],
    },
  },
};

export default preview;
