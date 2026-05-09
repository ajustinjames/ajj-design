import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-breadcrumb/ds-breadcrumb.js';

const meta: Meta = {
  title: 'Atoms/ds-breadcrumb',
  tags: ['autodocs'],
  render: () => html`
    <ds-breadcrumb>
      <li><a href="/">Home</a></li>
      <li><a href="/components">Components</a></li>
      <li aria-current="page">ds-breadcrumb</li>
    </ds-breadcrumb>
  `,
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
