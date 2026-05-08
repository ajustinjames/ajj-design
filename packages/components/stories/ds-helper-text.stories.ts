import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-helper-text/ds-helper-text.js';

const meta: Meta = {
  title: 'Atoms/ds-helper-text',
  tags: ['autodocs'],
  render: ({ text }) => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
      <input id="demo-input" type="text" placeholder="Enter value" style="padding:8px;border:1px solid #1A1A1A;" />
      <ds-helper-text for="demo-input">${text}</ds-helper-text>
    </div>
  `,
  argTypes: { text: { control: 'text' } },
  args: { text: 'Use CORE-ALPHA-01 format.' },
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
