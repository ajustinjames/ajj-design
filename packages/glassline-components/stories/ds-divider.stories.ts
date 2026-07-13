import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-divider/ds-divider.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-divider',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ orientation, tone }) => html`
    <div style="${orientation === 'vertical' ? 'display:flex;height:60px;gap:16px;align-items:center;' : 'width:280px;display:flex;flex-direction:column;gap:8px;'}">
      <span>Section A</span>
      <gl-divider orientation="${orientation}" tone="${tone}"></gl-divider>
      <span>Section B</span>
    </div>
  `,
  argTypes: {
    orientation: { control: { type: 'radio' }, options: ['horizontal', 'vertical'] },
    tone: { control: { type: 'radio' }, options: ['default', 'muted'] },
  },
  args: { orientation: 'horizontal', tone: 'default' },
};
export default meta;
type Story = StoryObj;
export const Horizontal: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical' } };
export const Muted: Story = { args: { tone: 'muted' } };
