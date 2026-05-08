import { fixture, html, expect } from '@open-wc/testing';
import type { DsLink } from '../src/ds-link/ds-link.js';
import '../src/ds-link/ds-link.js';

describe('ds-link', () => {
  it('defaults tone to default', async () => {
    const el = await fixture<DsLink>(html`<ds-link><a href="#">link</a></ds-link>`);
    expect(el.tone).to.equal('default');
  });

  it('reflects tone attribute', async () => {
    const el = await fixture<DsLink>(html`<ds-link tone="accent"><a href="#">link</a></ds-link>`);
    expect(el.getAttribute('tone')).to.equal('accent');
  });

  it('renders slotted anchor', async () => {
    const el = await fixture<DsLink>(html`<ds-link><a id="inner" href="#">go</a></ds-link>`);
    expect(el.querySelector('#inner')).to.exist;
  });
});
