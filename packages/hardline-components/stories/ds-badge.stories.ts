import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-badge/ds-badge.js';

const meta: Meta = {
  title: 'Atoms/hl-badge',
  tags: ['autodocs'],
  render: ({ tone, label }) => html`<hl-badge tone="${tone}">${label}</hl-badge>`,
  argTypes: {
    tone: { control: { type: 'select' }, options: ['default', 'accent', 'success', 'error', 'warning'] },
    label: { control: 'text' },
  },
  args: { tone: 'default', label: 'ACTIVE' },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Accent: Story = { args: { tone: 'accent', label: 'NEW' } };
export const Success: Story = { args: { tone: 'success', label: 'PASS' } };
export const Error: Story = { args: { tone: 'error', label: 'FAIL' } };
export const Warning: Story = { args: { tone: 'warning', label: 'WARN' } };
