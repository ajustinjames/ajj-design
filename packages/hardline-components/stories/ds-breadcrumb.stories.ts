import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-breadcrumb/ds-breadcrumb.js';

const meta: Meta = {
  title: 'Atoms/hl-breadcrumb',
  tags: ['autodocs'],
  render: () => html`
    <hl-breadcrumb>
      <li><a href="/">Home</a></li>
      <li><a href="/components">Components</a></li>
      <li aria-current="page">hl-breadcrumb</li>
    </hl-breadcrumb>
  `,
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
