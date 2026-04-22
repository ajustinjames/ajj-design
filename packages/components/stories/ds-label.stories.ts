import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-label/ds-label.js';

type DsLabelArgs = { tone: 'default' | 'muted' | 'accent'; text: string };

const meta: Meta<DsLabelArgs> = {
  title: 'Atoms/ds-label',
  tags: ['autodocs'],
  render: ({ tone, text }) => html`<ds-label tone="${tone}">${text}</ds-label>`,
  argTypes: {
    tone: { control: { type: 'radio' }, options: ['default', 'muted', 'accent'] },
    text: { control: 'text' },
  },
  args: { tone: 'default', text: 'System Key' },
};

export default meta;
type Story = StoryObj<DsLabelArgs>;

export const Default: Story = { args: { tone: 'default' } };
export const Muted: Story = { args: { tone: 'muted' } };
export const Accent: Story = { args: { tone: 'accent' } };
export const PairedWithInput: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:240px;">
      <ds-label id="lbl-demo" for="inp-demo">System Key</ds-label>
    </div>
  `,
};
