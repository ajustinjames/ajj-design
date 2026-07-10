import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-card/ds-card.js';
import { glassBackdrop } from './_glass-backdrop.js';

type DsCardArgs = { elevation: 1 | 2 | 3; withHeader: boolean };

const renderCard = (elevation: 1 | 2 | 3, withHeader = false) => html`
  <gl-card elevation="${elevation}" style="max-width:260px;">
    ${withHeader ? html`<strong slot="header">Panel ${elevation}</strong>` : ''}
    <p style="margin:0;">Glass surface at elevation ${elevation}.</p>
  </gl-card>
`;

const meta: Meta<DsCardArgs> = {
  title: 'Glassline/gl-card',
  tags: ['autodocs'],
  decorators: [glassBackdrop],
  render: ({ elevation, withHeader }) => renderCard(elevation, withHeader),
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
export const AllElevations: Story = {
  render: () => html`
    <div style="display:flex;gap:20px;align-items:flex-start;">
      ${renderCard(1, true)}
      ${renderCard(2, true)}
      ${renderCard(3, true)}
    </div>
  `,
};
export const HoverState: Story = {
  args: { elevation: 1 },
  parameters: { pseudo: { hover: true } },
};
