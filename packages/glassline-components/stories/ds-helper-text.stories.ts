import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-helper-text/ds-helper-text.js';

const fieldStyle = [
  'font-family:var(--gl-alias-font-ui, Inter, system-ui, sans-serif)',
  'font-size:14px',
  'line-height:1.4',
  'color:var(--gl-alias-text-main, #1A1A1A)',
  'background:var(--gl-alias-surface-bg, #FFFFFF)',
  'border:1px solid var(--gl-alias-surface-border, #1A1A1A)',
  'border-radius:0',
  'padding:8px 10px',
  'box-shadow:var(--gl-alias-shadow-1, 2px 2px 0px #000000)',
].join(';');

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-helper-text',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ text }) => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
      <input id="demo-input" type="text" placeholder="CORE-ALPHA-01" style="${fieldStyle}" />
      <gl-helper-text for="demo-input">${text}</gl-helper-text>
    </div>
  `,
  argTypes: { text: { control: 'text' } },
  args: { text: 'Use CORE-ALPHA-01 format.' },
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
