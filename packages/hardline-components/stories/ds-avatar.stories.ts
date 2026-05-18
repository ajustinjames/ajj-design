import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-avatar/ds-avatar.js';

const meta: Meta = {
  title: 'Atoms/hl-avatar',
  tags: ['autodocs'],
  render: ({ size, initials }) => html`
    <hl-avatar size="${size}" initials="${initials || ''}">
    </hl-avatar>
  `,
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    initials: { control: 'text' },
  },
  args: { size: 'md', initials: '' },
};
export default meta;
type Story = StoryObj;
export const Empty: Story = {};
export const Initials: Story = { args: { initials: 'AJ' } };
export const Large: Story = { args: { size: 'lg', initials: 'AJ' } };
