import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-breadcrumb/ds-breadcrumb.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-breadcrumb',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: () => html`
    <gl-breadcrumb>
      <li><a href="/">Home</a></li>
      <li><a href="/components">Components</a></li>
      <li aria-current="page">gl-breadcrumb</li>
    </gl-breadcrumb>
  `,
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
