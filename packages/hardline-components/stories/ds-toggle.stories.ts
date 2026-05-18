import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-toggle/ds-toggle.js';

const meta: Meta = {
  title: 'Atoms/hl-toggle',
  tags: ['autodocs'],
  render: ({ checked, disabled, label }) => html`
    <hl-toggle ?disabled="${disabled}">
      <input type="checkbox" id="toggle-story" ?checked="${checked}" ?disabled="${disabled}" />
      <label for="toggle-story">${label}</label>
    </hl-toggle>
  `,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { checked: false, disabled: false, label: 'Dark mode' },
};
export default meta;
type Story = StoryObj;
export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
