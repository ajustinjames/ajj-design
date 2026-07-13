import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-input/ds-input.js';
import '../src/ds-label/ds-label.js';
import { glassBackdrop } from './_glass-backdrop.js';

type DsInputArgs = {
  state: 'default' | 'error' | 'success';
  density: 'default' | 'compact';
  clinical: boolean;
  withUnit: boolean;
  withLabel: boolean;
};

const renderInput = ({ state, density, clinical, withUnit, withLabel }: DsInputArgs, id = 'inp-story') => html`
  <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
    ${withLabel ? html`<gl-label id="${id}-label" for="${id}">System Key</gl-label>` : ''}
    <gl-input
      state="${state}"
      density="${density}"
      label-for="${withLabel ? id : ''}"
      data-type="${clinical ? 'clinical' : ''}"
    >
      ${!withLabel ? html`<label slot="label" for="${id}">System Key</label>` : ''}
      <input id="${id}" type="text" placeholder="${clinical ? '0.00' : 'CORE-ALPHA-01'}" />
      ${withUnit ? html`<span slot="unit">mg</span>` : ''}
    </gl-input>
  </div>
`;

const meta: Meta<DsInputArgs> = {
  title: 'Glassline/gl-input',
  tags: ['autodocs'],
  decorators: [glassBackdrop],
  render: (args) => renderInput(args),
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
export const States: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${renderInput({ state: 'default', density: 'default', clinical: false, withUnit: false, withLabel: false }, 'inp-default')}
      ${renderInput({ state: 'error', density: 'default', clinical: false, withUnit: false, withLabel: false }, 'inp-error')}
      ${renderInput({ state: 'success', density: 'default', clinical: false, withUnit: false, withLabel: false }, 'inp-success')}
      ${renderInput({ state: 'default', density: 'default', clinical: true, withUnit: true, withLabel: false }, 'inp-clinical')}
    </div>
  `,
};
