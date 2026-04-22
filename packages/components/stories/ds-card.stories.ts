import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-card/ds-card.js';

type DsCardArgs = { elevation: 1 | 2 | 3; withHeader: boolean };

const meta: Meta<DsCardArgs> = {
  title: 'Atoms/ds-card',
  tags: ['autodocs'],
  render: ({ elevation, withHeader }) => html`
    <ds-card elevation="${elevation}">
      ${withHeader ? html`<strong slot="header">Card Header</strong>` : ''}
      <p>Body content — industrial surface at elevation ${elevation}.</p>
    </ds-card>
  `,
  argTypes: {
    elevation: { control: { type: 'radio' }, options: [1, 2, 3] },
    withHeader: { control: 'boolean' },
  },
  args: { elevation: 1, withHeader: false },
};

export default meta;
type Story = StoryObj<DsCardArgs>;

export const Elevation1: Story = { args: { elevation: 1 } };
export const Elevation2: Story = { args: { elevation: 2 } };
export const Elevation3: Story = { args: { elevation: 3 } };
export const WithHeader: Story = { args: { elevation: 1, withHeader: true } };
export const HoverState: Story = {
  args: { elevation: 1 },
  parameters: { pseudo: { hover: true } },
};
