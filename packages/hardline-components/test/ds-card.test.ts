import { fixture, html, expect } from '@open-wc/testing';
import type { DsCard } from '../src/ds-card/ds-card.js';
import '../src/ds-card/ds-card.js';

describe('hl-card', () => {
  it('has default elevation of 1', async () => {
    const el = await fixture<DsCard>(html`<hl-card></hl-card>`);
    expect(el.elevation).to.equal(1);
  });

  it('reflects elevation as attribute', async () => {
    const el = await fixture<DsCard>(html`<hl-card elevation="2"></hl-card>`);
    expect(el.getAttribute('elevation')).to.equal('2');
    expect(el.elevation).to.equal(2);
  });

  it('elevation 3 reflects attribute "3"', async () => {
    const el = await fixture<DsCard>(html`<hl-card elevation="3"></hl-card>`);
    expect(el.getAttribute('elevation')).to.equal('3');
  });

  it('renders slotted content in default slot', async () => {
    const el = await fixture<DsCard>(html`
      <hl-card><p id="body">content</p></hl-card>
    `);
    const slotted = el.querySelector('#body');
    expect(slotted).to.exist;
    expect(slotted!.textContent).to.equal('content');
  });

  it('renders content in named header slot', async () => {
    const el = await fixture<DsCard>(html`
      <hl-card><span slot="header" id="hdr">Header</span></hl-card>
    `);
    const hdr = el.querySelector('#hdr');
    expect(hdr).to.exist;
  });

  it('has display: block on :host', async () => {
    const el = await fixture<DsCard>(html`<hl-card></hl-card>`);
    const display = getComputedStyle(el).display;
    expect(display).to.equal('block');
  });

  it('defaults interactive to false', async () => {
    const el = await fixture<DsCard>(html`<hl-card>content</hl-card>`);
    expect(el.interactive).to.be.false;
    expect(el.hasAttribute('interactive')).to.be.false;
  });

  it('reflects interactive attribute when true', async () => {
    const el = await fixture<DsCard>(html`<hl-card interactive>content</hl-card>`);
    expect(el.interactive).to.be.true;
    expect(el.hasAttribute('interactive')).to.be.true;
  });
});
