import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-checkbox/ds-checkbox.js';

const meta: Meta = {
  title: 'Atoms/ds-checkbox',
  tags: ['autodocs'],
  render: ({ checked, disabled, label }) => html`
    <ds-checkbox ?disabled="${disabled}">
      <input type="checkbox" id="cb-story" ?checked="${checked}" ?disabled="${disabled}" />
      <label for="cb-story">${label}</label>
    </ds-checkbox>
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
