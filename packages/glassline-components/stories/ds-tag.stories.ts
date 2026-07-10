import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-tag/ds-tag.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-tag',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ label, dismissible }) => html`
    <gl-tag ?dismissible="${dismissible}">
      ${label}
      ${dismissible ? html`<button slot="dismiss" onclick="this.closest('gl-tag').remove()">×</button>` : ''}
    </gl-tag>
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
