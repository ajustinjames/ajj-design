import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-checkbox/ds-checkbox.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-checkbox',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ checked, disabled, label }) => html`
    <gl-checkbox ?disabled="${disabled}">
      <input type="checkbox" id="cb-story" ?checked="${checked}" ?disabled="${disabled}" />
      <label for="cb-story">${label}</label>
    </gl-checkbox>
  `,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { checked: false, disabled: false, label: 'Enable feature' },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const CheckedDisabled: Story = { args: { checked: true, disabled: true } };
