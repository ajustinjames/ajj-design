import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-code/ds-code.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-code',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ inline, language, content }) => inline
    ? html`<p>Run <gl-code inline>${content}</gl-code> in terminal.</p>`
    : html`<gl-code language="${language}">${content}</gl-code>`,
  argTypes: {
    inline: { control: 'boolean' },
    language: { control: 'text' },
    content: { control: 'text' },
  },
  args: { inline: false, language: 'typescript', content: 'const x: number = 42;' },
};
export default meta;
type Story = StoryObj;
export const Block: Story = {};
export const Inline: Story = { args: { inline: true, content: 'pnpm install' } };
export const WithLanguage: Story = { args: { language: 'bash', content: 'pnpm tokens:build' } };
