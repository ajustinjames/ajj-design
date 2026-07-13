import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-radio/ds-radio.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-radio',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ checked, disabled }) => html`
    <fieldset style="border:none;padding:0;display:flex;flex-direction:column;gap:8px;">
      <gl-radio ?disabled="${disabled}">
        <input type="radio" name="demo" id="r1" ?checked="${checked}" ?disabled="${disabled}" />
        <label for="r1">Option A</label>
      </gl-radio>
      <gl-radio ?disabled="${disabled}">
        <input type="radio" name="demo" id="r2" ?disabled="${disabled}" />
        <label for="r2">Option B</label>
      </gl-radio>
    </fieldset>
  `,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { checked: false, disabled: false },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
