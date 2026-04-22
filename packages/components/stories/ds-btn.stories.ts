import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-btn/ds-btn.js';

type DsBtnArgs = {
  variant: 'default' | 'primary' | 'ghost';
  size: 'sm' | 'md';
  label: string;
};

const meta: Meta<DsBtnArgs> = {
  title: 'Atoms/ds-btn',
  tags: ['autodocs'],
  render: ({ variant, size, label }) => html`
    <ds-btn variant="${variant}" size="${size}">
      <button type="button">${label}</button>
    </ds-btn>
  `,
  argTypes: {
    variant: { control: { type: 'radio' }, options: ['default', 'primary', 'ghost'] },
    size: { control: { type: 'radio' }, options: ['sm', 'md'] },
    label: { control: 'text' },
  },
  args: { variant: 'default', size: 'md', label: 'Execute Protocol' },
};

export default meta;
type Story = StoryObj<DsBtnArgs>;

export const Default: Story = { args: { variant: 'default' } };
export const Primary: Story = { args: { variant: 'primary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const SmDefault: Story = { args: { size: 'sm', variant: 'default' } };
export const SmPrimary: Story = { args: { size: 'sm', variant: 'primary' } };
export const FocusVisible: Story = {
  args: { variant: 'default' },
  parameters: { pseudo: { focusVisible: true } },
};
export const Active: Story = {
  args: { variant: 'primary' },
  parameters: { pseudo: { active: true } },
};
