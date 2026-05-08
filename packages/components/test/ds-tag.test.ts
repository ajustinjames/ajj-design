import { fixture, html, expect } from '@open-wc/testing';
import type { DsTag } from '../src/ds-tag/ds-tag.js';
import '../src/ds-tag/ds-tag.js';

describe('ds-tag', () => {
  it('defaults dismissible to false', async () => {
    const el = await fixture<DsTag>(html`<ds-tag>category</ds-tag>`);
    expect(el.dismissible).to.be.false;
  });

  it('reflects dismissible attribute', async () => {
    const el = await fixture<DsTag>(html`<ds-tag dismissible>category</ds-tag>`);
    expect(el.hasAttribute('dismissible')).to.be.true;
  });

  it('renders dismiss slot when dismissible', async () => {
    const el = await fixture<DsTag>(html`
      <ds-tag dismissible>
        category
        <button slot="dismiss" id="dismiss-btn">×</button>
      </ds-tag>
    `);
    expect(el.querySelector('#dismiss-btn')).to.exist;
  });
});
