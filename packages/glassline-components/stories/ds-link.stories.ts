import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-link/ds-link.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-link',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ tone, label }) => html`
    <gl-link tone="${tone}"><a href="#">${label}</a></gl-link>
  `,
  argTypes: {
    tone: { control: { type: 'select' }, options: ['default', 'muted', 'accent'] },
    label: { control: 'text' },
  },
  args: { tone: 'default', label: 'View documentation' },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Muted: Story = { args: { tone: 'muted' } };
export const Accent: Story = { args: { tone: 'accent' } };
