import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-tag/ds-tag.js';

const meta: Meta = {
  title: 'Atoms/ds-tag',
  tags: ['autodocs'],
  render: ({ label, dismissible }) => html`
    <ds-tag ?dismissible="${dismissible}">
      ${label}
      ${dismissible ? html`<button slot="dismiss" onclick="this.closest('ds-tag').remove()">×</button>` : ''}
    </ds-tag>
  `,
  argTypes: {
    label: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  args: { label: 'design-system', dismissible: false },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Dismissible: Story = { args: { dismissible: true } };
