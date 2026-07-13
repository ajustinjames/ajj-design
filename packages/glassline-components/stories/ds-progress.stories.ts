import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-progress/ds-progress.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-progress',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ value }) => html`
    <gl-progress value="${value}" style="width:300px;">
      <progress value="${value}" max="100"></progress>
    </gl-progress>
  `,
  argTypes: { value: { control: { type: 'range', min: 0, max: 100, step: 1 } } },
  args: { value: 40 },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Half: Story = { args: { value: 50 } };
export const Complete: Story = { args: { value: 100 } };
