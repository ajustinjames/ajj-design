import '../packages/tokens/dist/web/tokens.css';
import type { Preview } from '@storybook/web-components';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'paper',
      values: [
        { name: 'paper', value: '#F0F0EC' },
        { name: 'white', value: '#FFFFFF' },
      ],
    },
  },
};

export default preview;
