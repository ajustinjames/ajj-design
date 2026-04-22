import { fixture, html, expect } from '@open-wc/testing';
import type { DsCard } from '../src/ds-card/ds-card.js';
import '../src/ds-card/ds-card.js';

describe('ds-card', () => {
  it('has default elevation of 1', async () => {
    const el = await fixture<DsCard>(html`<ds-card></ds-card>`);
    expect(el.elevation).to.equal(1);
  });

  it('reflects elevation as attribute', async () => {
    const el = await fixture<DsCard>(html`<ds-card elevation="2"></ds-card>`);
    expect(el.getAttribute('elevation')).to.equal('2');
    expect(el.elevation).to.equal(2);
  });

  it('elevation 3 reflects attribute "3"', async () => {
    const el = await fixture<DsCard>(html`<ds-card elevation="3"></ds-card>`);
    expect(el.getAttribute('elevation')).to.equal('3');
  });

  it('renders slotted content in default slot', async () => {
    const el = await fixture<DsCard>(html`
      <ds-card><p id="body">content</p></ds-card>
    `);
    const slotted = el.querySelector('#body');
    expect(slotted).to.exist;
    expect(slotted!.textContent).to.equal('content');
  });

  it('renders content in named header slot', async () => {
    const el = await fixture<DsCard>(html`
      <ds-card><span slot="header" id="hdr">Header</span></ds-card>
    `);
    const hdr = el.querySelector('#hdr');
    expect(hdr).to.exist;
  });

  it('has display: block on :host', async () => {
    const el = await fixture<DsCard>(html`<ds-card></ds-card>`);
    const display = getComputedStyle(el).display;
    expect(display).to.equal('block');
  });
});
