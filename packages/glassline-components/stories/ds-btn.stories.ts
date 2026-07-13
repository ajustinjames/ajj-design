import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-btn/ds-btn.js';
import { glassBackdrop } from './_glass-backdrop.js';

type DsBtnArgs = {
  variant: 'default' | 'primary' | 'ghost';
  size: 'sm' | 'md';
  label: string;
};

const renderButton = (variant: DsBtnArgs['variant'], size: DsBtnArgs['size'], label: string) => html`
  <gl-btn variant="${variant}" size="${size}">
    <button type="button">${label}</button>
  </gl-btn>
`;

const meta: Meta<DsBtnArgs> = {
  title: 'Glassline/gl-btn',
  tags: ['autodocs'],
  decorators: [glassBackdrop],
  render: ({ variant, size, label }) => renderButton(variant, size, label),
  argTypes: {
    variant: { control: { type: 'radio' }, options: ['default', 'primary', 'ghost'] },
    size: { control: { type: 'radio' }, options: ['sm', 'md'] },
    label: { control: 'text' },
  },
  args: { variant: 'default', size: 'md', label: 'Continue' },
};

export default meta;
type Story = StoryObj<DsBtnArgs>;

export const Default: Story = { args: { variant: 'default' } };
export const Primary: Story = { args: { variant: 'primary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const SmDefault: Story = { args: { size: 'sm', variant: 'default' } };
export const SmPrimary: Story = { args: { size: 'sm', variant: 'primary' } };
export const AllVariants: Story = {
  render: () => html`
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;">
      ${renderButton('default', 'md', 'Default')}
      ${renderButton('primary', 'md', 'Primary')}
      ${renderButton('ghost', 'md', 'Ghost')}
      ${renderButton('default', 'sm', 'Small')}
    </div>
  `,
};
export const FocusVisible: Story = {
  args: { variant: 'default' },
  parameters: { pseudo: { focusVisible: true } },
};
export const Active: Story = {
  args: { variant: 'primary' },
  parameters: { pseudo: { active: true } },
};
