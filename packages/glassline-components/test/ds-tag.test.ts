import { fixture, html, expect } from '@open-wc/testing';
import type { DsTag } from '../src/ds-tag/ds-tag.js';
import '../src/ds-tag/ds-tag.js';

describe('gl-tag', () => {
  it('defaults dismissible to false', async () => {
    const el = await fixture<DsTag>(html`<gl-tag>category</gl-tag>`);
    expect(el.dismissible).to.be.false;
  });

  it('reflects dismissible attribute', async () => {
    const el = await fixture<DsTag>(html`<gl-tag dismissible>category</gl-tag>`);
    expect(el.hasAttribute('dismissible')).to.be.true;
  });

  it('renders dismiss slot when dismissible', async () => {
    const el = await fixture<DsTag>(html`
      <gl-tag dismissible>
        category
        <button slot="dismiss" id="dismiss-btn">×</button>
      </gl-tag>
    `);
    expect(el.querySelector('#dismiss-btn')).to.exist;
  });
});
