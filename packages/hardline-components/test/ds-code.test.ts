import { fixture, html, expect } from '@open-wc/testing';
import type { DsCode } from '../src/ds-code/ds-code.js';
import '../src/ds-code/ds-code.js';

describe('hl-code', () => {
  it('defaults inline to false', async () => {
    const el = await fixture<DsCode>(html`<hl-code>const x = 1;</hl-code>`);
    expect(el.inline).to.be.false;
  });

  it('reflects inline attribute', async () => {
    const el = await fixture<DsCode>(html`<hl-code inline>const x = 1;</hl-code>`);
    expect(el.hasAttribute('inline')).to.be.true;
  });

  it('accepts language prop', async () => {
    const el = await fixture<DsCode>(html`<hl-code language="typescript">const x = 1;</hl-code>`);
    expect(el.language).to.equal('typescript');
  });
});
