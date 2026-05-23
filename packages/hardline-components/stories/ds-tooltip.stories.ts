import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-btn/ds-btn.js';
import '../src/ds-tooltip/ds-tooltip.js';

const meta: Meta = {
  title: 'Atoms/hl-tooltip',
  tags: ['autodocs'],
  render: ({ placement, content }) => html`
    <div style="padding:60px;display:inline-block;">
      <hl-btn variant="default" size="sm">
        <button id="tooltip-anchor" type="button">Inspect Node</button>
      </hl-btn>
      <hl-tooltip for="tooltip-anchor" placement="${placement}">${content}</hl-tooltip>
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
