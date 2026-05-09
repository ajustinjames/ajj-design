import { fixture, html, expect } from '@open-wc/testing';
import type { DsErrorMessage } from '../src/ds-error-message/ds-error-message.js';
import '../src/ds-error-message/ds-error-message.js';

describe('ds-error-message', () => {
  it('renders as inline-block', async () => {
    const el = await fixture<DsErrorMessage>(html`<ds-error-message>Error</ds-error-message>`);
    expect(getComputedStyle(el).display).to.equal('inline-block');
  });

  it('adds aria-errormessage and aria-invalid to target', async () => {
    const input = document.createElement('input');
    input.id = 'target-err';
    document.body.appendChild(input);
    const el = await fixture<DsErrorMessage>(html`<ds-error-message for="target-err">Required</ds-error-message>`);
    expect(input.getAttribute('aria-errormessage')).to.include(el.id);
    expect(input.getAttribute('aria-invalid')).to.equal('true');
    input.remove();
  });
});
