import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-label/ds-label.js';

type DsLabelArgs = { tone: 'default' | 'muted' | 'accent'; text: string };

const meta: Meta<DsLabelArgs> = {
  title: 'Atoms/hl-label',
  tags: ['autodocs'],
  render: ({ tone, text }) => html`<hl-label tone="${tone}">${text}</hl-label>`,
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
      <hl-label id="lbl-demo" for="inp-demo">System Key</hl-label>
    </div>
  `,
};
