import { fixture, html, expect } from '@open-wc/testing';
import type { DsCheckbox } from '../src/ds-checkbox/ds-checkbox.js';
import '../src/ds-checkbox/ds-checkbox.js';

describe('ds-checkbox', () => {
  it('defaults checked to false', async () => {
    const el = await fixture<DsCheckbox>(html`
      <ds-checkbox><input type="checkbox" /><label>Option</label></ds-checkbox>
    `);
    expect(el.checked).to.be.false;
  });

  it('reflects checked from slotted native on connect', async () => {
    const el = await fixture<DsCheckbox>(html`
      <ds-checkbox><input type="checkbox" checked /><label>Option</label></ds-checkbox>
    `);
    expect(el.checked).to.be.true;
    expect(el.hasAttribute('checked')).to.be.true;
  });

  it('updates checked on native change event', async () => {
    const el = await fixture<DsCheckbox>(html`
      <ds-checkbox><input id="cb" type="checkbox" /><label>Option</label></ds-checkbox>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    native.checked = true;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it('defaults disabled to false', async () => {
    const el = await fixture<DsCheckbox>(html`
      <ds-checkbox><input type="checkbox" /></ds-checkbox>
    `);
    expect(el.disabled).to.be.false;
  });
});
