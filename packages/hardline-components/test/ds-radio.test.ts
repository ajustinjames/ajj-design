import { fixture, html, expect } from '@open-wc/testing';
import type { DsRadio } from '../src/ds-radio/ds-radio.js';
import '../src/ds-radio/ds-radio.js';

describe('hl-radio', () => {
  it('defaults checked to false', async () => {
    const el = await fixture<DsRadio>(html`
      <hl-radio><input type="radio" /><label>Option A</label></hl-radio>
    `);
    expect(el.checked).to.be.false;
  });

  it('reflects checked from native on connect', async () => {
    const el = await fixture<DsRadio>(html`
      <hl-radio><input type="radio" checked /><label>Option A</label></hl-radio>
    `);
    expect(el.checked).to.be.true;
  });

  it('updates checked on native change event', async () => {
    const el = await fixture<DsRadio>(html`
      <hl-radio><input type="radio" /><label>Option A</label></hl-radio>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    native.checked = true;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it('shows a visible focus outline on the indicator when the slotted input is focused', async () => {
    const el = await fixture<DsRadio>(html`
      <hl-radio><input type="radio" /><label>Option A</label></hl-radio>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    native.focus();
    await el.updateComplete;
    const indicator = el.shadowRoot!.querySelector<HTMLElement>('.indicator')!;
    const computed = getComputedStyle(indicator);
    expect(computed.outlineStyle).to.equal('solid');
    expect(computed.outlineWidth).to.not.equal('0px');
  });
});
