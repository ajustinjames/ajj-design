import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-helper-text/ds-helper-text.js';
import '../src/ds-input/ds-input.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-helper-text',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ text }) => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
      <gl-input>
        <input id="demo-input" type="text" placeholder="CORE-ALPHA-01" aria-label="System key" />
      </gl-input>
      <gl-helper-text for="demo-input">${text}</gl-helper-text>
    </div>
  `,
  argTypes: { text: { control: 'text' } },
  args: { text: 'Use CORE-ALPHA-01 format.' },
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
