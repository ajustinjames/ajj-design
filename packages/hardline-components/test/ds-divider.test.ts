import { fixture, html, expect } from '@open-wc/testing';
import type { DsDivider } from '../src/ds-divider/ds-divider.js';
import '../src/ds-divider/ds-divider.js';

describe('hl-divider', () => {
  it('has role separator', async () => {
    const el = await fixture<DsDivider>(html`<hl-divider></hl-divider>`);
    expect(el.getAttribute('role')).to.equal('separator');
  });

  it('defaults orientation to horizontal', async () => {
    const el = await fixture<DsDivider>(html`<hl-divider></hl-divider>`);
    expect(el.orientation).to.equal('horizontal');
  });

  it('reflects orientation attribute', async () => {
    const el = await fixture<DsDivider>(html`<hl-divider orientation="vertical"></hl-divider>`);
    expect(el.getAttribute('orientation')).to.equal('vertical');
  });
});
