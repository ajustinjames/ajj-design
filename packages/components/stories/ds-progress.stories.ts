import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-progress/ds-progress.js';

const meta: Meta = {
  title: 'Atoms/ds-progress',
  tags: ['autodocs'],
  render: ({ value }) => html`
    <ds-progress value="${value}" style="width:300px;">
      <progress value="${value}" max="100"></progress>
    </ds-progress>
  `,
  argTypes: { value: { control: { type: 'range', min: 0, max: 100, step: 1 } } },
  args: { value: 40 },
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Half: Story = { args: { value: 50 } };
export const Complete: Story = { args: { value: 100 } };
