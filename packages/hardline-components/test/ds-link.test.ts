import { fixture, html, expect } from '@open-wc/testing';
import type { DsLink } from '../src/ds-link/ds-link.js';
import '../src/ds-link/ds-link.js';

describe('hl-link', () => {
  it('defaults tone to default', async () => {
    const el = await fixture<DsLink>(html`<hl-link><a href="#">link</a></hl-link>`);
    expect(el.tone).to.equal('default');
  });

  it('reflects tone attribute', async () => {
    const el = await fixture<DsLink>(html`<hl-link tone="accent"><a href="#">link</a></hl-link>`);
    expect(el.getAttribute('tone')).to.equal('accent');
  });

  it('renders slotted anchor', async () => {
    const el = await fixture<DsLink>(html`<hl-link><a id="inner" href="#">go</a></hl-link>`);
    expect(el.querySelector('#inner')).to.exist;
  });
});
