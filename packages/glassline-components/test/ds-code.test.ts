import { fixture, html, expect } from '@open-wc/testing';
import type { DsCode } from '../src/ds-code/ds-code.js';
import '../src/ds-code/ds-code.js';

describe('gl-code', () => {
  it('defaults inline to false', async () => {
    const el = await fixture<DsCode>(html`<gl-code>const x = 1;</gl-code>`);
    expect(el.inline).to.be.false;
  });

  it('reflects inline attribute', async () => {
    const el = await fixture<DsCode>(html`<gl-code inline>const x = 1;</gl-code>`);
    expect(el.hasAttribute('inline')).to.be.true;
  });

  it('accepts language prop', async () => {
    const el = await fixture<DsCode>(html`<gl-code language="typescript">const x = 1;</gl-code>`);
    expect(el.language).to.equal('typescript');
  });
});
