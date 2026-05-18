import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-alert/ds-alert.js';

const meta: Meta = {
  title: 'Atoms/hl-alert',
  tags: ['autodocs'],
  render: ({ tone, header, body }) => html`
    <hl-alert tone="${tone}" style="max-width:400px;">
      <span slot="header">${header}</span>
      <p>${body}</p>
    </hl-alert>
  `,
  argTypes: {
    tone: { control: { type: 'select' }, options: ['info', 'success', 'warning', 'error'] },
    header: { control: 'text' },
    body: { control: 'text' },
  },
  args: { tone: 'info', header: 'System notice', body: 'Configuration updated successfully.' },
};
export default meta;
type Story = StoryObj;
export const Info: Story = {};
export const Success: Story = { args: { tone: 'success', header: 'Build complete' } };
export const Warning: Story = { args: { tone: 'warning', header: 'Rate limit' } };
export const Error: Story = { args: { tone: 'error', header: 'Build failed' } };
