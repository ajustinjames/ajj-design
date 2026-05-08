import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-select/ds-select.js';

const meta: Meta = {
  title: 'Atoms/ds-select',
  tags: ['autodocs'],
  render: ({ state, disabled }) => html`
    <ds-select state="${state}" ?disabled="${disabled}" style="width:240px;">
      <select id="sel-story" ?disabled="${disabled}">
        <option value="">Select option</option>
        <option value="alpha">CORE-ALPHA</option>
        <option value="beta">CORE-BETA</option>
        <option value="gamma">CORE-GAMMA</option>
      </select>
    </ds-select>
  `,
  argTypes: {
    state: { control: { type: 'select' }, options: ['default', 'error', 'success'] },
    disabled: { control: 'boolean' },
  },
  args: { state: 'default', disabled: false },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Error: Story = { args: { state: 'error' } };
export const Success: Story = { args: { state: 'success' } };
export const Disabled: Story = { args: { disabled: true } };
