import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-error-message/ds-error-message.js';

const fieldStyle = [
  'font-family:var(--gl-alias-font-ui, Inter, system-ui, sans-serif)',
  'font-size:14px',
  'line-height:1.4',
  'color:var(--gl-alias-text-main, #1A1A1A)',
  'background:var(--gl-alias-surface-bg, #FFFFFF)',
  'border:1px solid var(--gl-alias-status-error, #CC0000)',
  'border-radius:0',
  'padding:8px 10px',
  'box-shadow:var(--gl-alias-shadow-1, 2px 2px 0px #000000)',
].join(';');

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-error-message',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ text }) => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
      <input id="demo-err" type="text" aria-invalid="true" value="CORE-" style="${fieldStyle}" />
      <gl-error-message for="demo-err">${text}</gl-error-message>
    </div>
  `,
  argTypes: { text: { control: 'text' } },
  args: { text: 'This field is required.' },
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
