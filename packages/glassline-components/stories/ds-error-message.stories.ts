import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/ds-error-message/ds-error-message.js';
import '../src/ds-input/ds-input.js';

import { glassBackdrop } from './_glass-backdrop.js';
const meta: Meta = {
  title: 'Glassline/gl-error-message',
  decorators: [glassBackdrop],
  tags: ['autodocs'],
  render: ({ text }) => html`
    <div style="display:flex;flex-direction:column;gap:4px;width:280px;">
      <gl-input state="error">
        <input id="demo-err" type="text" aria-invalid="true" value="CORE-" aria-label="System key" />
      </gl-input>
      <gl-error-message for="demo-err">${text}</gl-error-message>
    </div>
  `,
  argTypes: { text: { control: 'text' } },
  args: { text: 'This field is required.' },
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
