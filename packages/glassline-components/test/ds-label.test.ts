import { fixture, html, expect } from '@open-wc/testing';
import type { DsLabel } from '../src/ds-label/ds-label.js';
import '../src/ds-label/ds-label.js';

describe('gl-label', () => {
  it('has display: block', async () => {
    const el = await fixture<DsLabel>(html`<gl-label>Field</gl-label>`);
    expect(getComputedStyle(el).display).to.equal('block');
  });

  it('defaults tone to "default"', async () => {
    const el = await fixture<DsLabel>(html`<gl-label>X</gl-label>`);
    expect(el.tone).to.equal('default');
  });

  it('reflects tone attribute', async () => {
    const el = await fixture<DsLabel>(html`<gl-label tone="muted">X</gl-label>`);
    expect(el.getAttribute('tone')).to.equal('muted');
  });

  it('reflects accent tone attribute', async () => {
    const el = await fixture<DsLabel>(html`<gl-label tone="accent">X</gl-label>`);
    expect(el.getAttribute('tone')).to.equal('accent');
  });

  it('renders slotted text', async () => {
    const el = await fixture<DsLabel>(html`<gl-label>System Key</gl-label>`);
    expect(el.textContent?.trim()).to.equal('System Key');
  });

  it('reflects the "for" property as attribute', async () => {
    const el = await fixture<DsLabel>(html`<gl-label for="my-input">Label</gl-label>`);
    expect(el.getAttribute('for')).to.equal('my-input');
    expect(el.for).to.equal('my-input');
  });

  it('writes aria-labelledby on the target when "for" is set', async () => {
    const container = await fixture(html`
      <div>
        <gl-label id="lbl" for="inp">Label</gl-label>
        <input id="inp" />
      </div>
    `);
    const input = container.querySelector<HTMLInputElement>('#inp')!;
    expect(input.getAttribute('aria-labelledby')).to.include('lbl');
  });

  it('applies text-transform: uppercase', async () => {
    const el = await fixture<DsLabel>(html`<gl-label>label text</gl-label>`);
    expect(getComputedStyle(el).textTransform).to.equal('uppercase');
  });
});
