import { fixture, html, expect } from '@open-wc/testing';
import type { DsCode } from '../src/ds-code/ds-code.js';
import '../src/ds-code/ds-code.js';

describe('ds-code', () => {
  it('defaults inline to false', async () => {
    const el = await fixture<DsCode>(html`<ds-code>const x = 1;</ds-code>`);
    expect(el.inline).to.be.false;
  });

  it('reflects inline attribute', async () => {
    const el = await fixture<DsCode>(html`<ds-code inline>const x = 1;</ds-code>`);
    expect(el.hasAttribute('inline')).to.be.true;
  });

  it('accepts language prop', async () => {
    const el = await fixture<DsCode>(html`<ds-code language="typescript">const x = 1;</ds-code>`);
    expect(el.language).to.equal('typescript');
  });
});
