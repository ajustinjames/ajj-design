import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-input/ds-input.js';
import '../src/ds-label/ds-label.js';

type DsInputArgs = {
  state: 'default' | 'error' | 'success';
  density: 'default' | 'compact';
  clinical: boolean;
  withUnit: boolean;
  withLabel: boolean;
};

const meta: Meta<DsInputArgs> = {
  title: 'Atoms/ds-input',
  tags: ['autodocs'],
  render: ({ state, density, clinical, withUnit, withLabel }) => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
      ${withLabel
        ? html`<ds-label id="lbl-story" for="inp-story">System Key</ds-label>`
        : ''}
      <ds-input
        state="${state}"
        density="${density}"
        label-for="${withLabel ? 'inp-story' : ''}"
      >
        ${!withLabel
          ? html`<label slot="label" for="inp-story">System Key</label>`
          : ''}
        <input id="inp-story" type="text" placeholder="${clinical ? '0.00' : 'CORE-ALPHA-01'}" />
        ${withUnit ? html`<span slot="unit">mg</span>` : ''}
      </ds-input>
    </div>
  `,
  argTypes: {
    state: { control: { type: 'radio' }, options: ['default', 'error', 'success'] },
    density: { control: { type: 'radio' }, options: ['default', 'compact'] },
    clinical: { control: 'boolean' },
    withUnit: { control: 'boolean' },
    withLabel: { control: 'boolean' },
  },
  args: { state: 'default', density: 'default', clinical: false, withUnit: false, withLabel: false },
};

export default meta;
type Story = StoryObj<DsInputArgs>;

export const Default: Story = { args: { state: 'default' } };
export const Error: Story = { args: { state: 'error' } };
export const Success: Story = { args: { state: 'success' } };
export const Compact: Story = { args: { density: 'compact' } };
export const Clinical: Story = { args: { clinical: true, withUnit: true } };
export const WithUnit: Story = { args: { withUnit: true } };
export const WithLabelSlot: Story = { args: { withLabel: false } };
export const WithExternalLabel: Story = { args: { withLabel: true } };
