import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-error-message/ds-error-message.js';

const meta: Meta = {
  title: 'Atoms/ds-error-message',
  tags: ['autodocs'],
  render: ({ text }) => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
      <input id="demo-err" type="text" aria-invalid="true" style="padding:8px;border:1px solid #CC0000;" />
      <ds-error-message for="demo-err">${text}</ds-error-message>
    </div>
  `,
  argTypes: { text: { control: 'text' } },
  args: { text: 'This field is required.' },
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
