import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-spinner/ds-spinner.js';

const meta: Meta = {
  title: 'Atoms/hl-spinner',
  tags: ['autodocs'],
  render: ({ size, label }) => html`<hl-spinner size="${size}" label="${label}"></hl-spinner>`,
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  args: { size: 'md', label: 'Loading' },
};
export default meta;
type Story = StoryObj;
export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = { args: { size: 'lg' } };
