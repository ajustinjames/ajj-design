import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-tooltip/ds-tooltip.js';

const meta: Meta = {
  title: 'Atoms/ds-tooltip',
  tags: ['autodocs'],
  render: ({ placement, content }) => html`
    <div style="padding:60px;display:inline-block;">
      <button id="tooltip-anchor" style="padding:8px 16px;border:1px solid #1A1A1A;cursor:pointer;">
        Hover me
      </button>
      <ds-tooltip for="tooltip-anchor" placement="${placement}">${content}</ds-tooltip>
    </div>
  `,
  argTypes: {
    placement: { control: { type: 'select' }, options: ['top', 'bottom', 'left', 'right'] },
    content: { control: 'text' },
  },
  args: { placement: 'top', content: 'System identifier' },
};

export default meta;
type Story = StoryObj;
export const Top: Story = { args: { placement: 'top' } };
export const Bottom: Story = { args: { placement: 'bottom' } };
