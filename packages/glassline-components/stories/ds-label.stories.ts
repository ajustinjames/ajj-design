import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-label/ds-label.js';

type DsLabelArgs = { tone: 'default' | 'muted' | 'accent'; text: string };

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta<DsLabelArgs> = {
  title: 'Glassline/gl-label',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ tone, text }) => html`<gl-label tone="${tone}">${text}</gl-label>`,
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
export const AllTones: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:8px;">
      <gl-label tone="default">Default Label</gl-label>
      <gl-label tone="muted">Muted Label</gl-label>
      <gl-label tone="accent">Accent Label</gl-label>
    </div>
  `,
};
export const PairedWithInput: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:240px;">
      <gl-label id="lbl-demo" for="inp-demo">System Key</gl-label>
    </div>
  `,
};
