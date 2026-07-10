import { fixture, html, expect } from '@open-wc/testing';
import type { DsHelperText } from '../src/ds-helper-text/ds-helper-text.js';
import '../src/ds-helper-text/ds-helper-text.js';

describe('gl-helper-text', () => {
  it('renders as inline-block', async () => {
    const el = await fixture<DsHelperText>(html`<gl-helper-text>hint text</gl-helper-text>`);
    expect(getComputedStyle(el).display).to.equal('inline-block');
  });

  it('accepts a for prop', async () => {
    const el = await fixture<DsHelperText>(html`<gl-helper-text for="my-input">hint</gl-helper-text>`);
    expect(el.for).to.equal('my-input');
  });

  it('adds aria-describedby to target when for is set', async () => {
    const input = document.createElement('input');
    input.id = 'target-inp';
    document.body.appendChild(input);
    const el = await fixture<DsHelperText>(html`<gl-helper-text for="target-inp">hint</gl-helper-text>`);
    expect(input.getAttribute('aria-describedby')).to.include(el.id);
    input.remove();
  });
});
