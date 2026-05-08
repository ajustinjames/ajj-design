import { fixture, html, expect } from '@open-wc/testing';
import type { DsRadio } from '../src/ds-radio/ds-radio.js';
import '../src/ds-radio/ds-radio.js';

describe('ds-radio', () => {
  it('defaults checked to false', async () => {
    const el = await fixture<DsRadio>(html`
      <ds-radio><input type="radio" /><label>Option A</label></ds-radio>
    `);
    expect(el.checked).to.be.false;
  });

  it('reflects checked from native on connect', async () => {
    const el = await fixture<DsRadio>(html`
      <ds-radio><input type="radio" checked /><label>Option A</label></ds-radio>
    `);
    expect(el.checked).to.be.true;
  });

  it('updates checked on native change event', async () => {
    const el = await fixture<DsRadio>(html`
      <ds-radio><input type="radio" /><label>Option A</label></ds-radio>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    native.checked = true;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });
});
