import { fixture, html, expect } from '@open-wc/testing';
import type { DsCheckbox } from '../src/ds-checkbox/ds-checkbox.js';
import '../src/ds-checkbox/ds-checkbox.js';

describe('hl-checkbox', () => {
  it('defaults checked to false', async () => {
    const el = await fixture<DsCheckbox>(html`
      <hl-checkbox><input type="checkbox" /><label>Option</label></hl-checkbox>
    `);
    expect(el.checked).to.be.false;
  });

  it('reflects checked from slotted native on connect', async () => {
    const el = await fixture<DsCheckbox>(html`
      <hl-checkbox><input type="checkbox" checked /><label>Option</label></hl-checkbox>
    `);
    expect(el.checked).to.be.true;
    expect(el.hasAttribute('checked')).to.be.true;
  });

  it('updates checked on native change event', async () => {
    const el = await fixture<DsCheckbox>(html`
      <hl-checkbox><input id="cb" type="checkbox" /><label>Option</label></hl-checkbox>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    native.checked = true;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it('defaults disabled to false', async () => {
    const el = await fixture<DsCheckbox>(html`
      <hl-checkbox><input type="checkbox" /></hl-checkbox>
    `);
    expect(el.disabled).to.be.false;
  });

  it('reflects indeterminate from slotted native on connect', async () => {
    const el = await fixture<DsCheckbox>(html`
      <hl-checkbox><input id="cb" type="checkbox" .indeterminate=${true} /><label>Option</label></hl-checkbox>
    `);
    expect(el.indeterminate).to.be.true;
    expect(el.hasAttribute('indeterminate')).to.be.true;
  });

  it('updates indeterminate on native change event', async () => {
    const el = await fixture<DsCheckbox>(html`
      <hl-checkbox><input id="cb" type="checkbox" /><label>Option</label></hl-checkbox>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    native.indeterminate = true;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(el.indeterminate).to.be.true;
  });

  it('shows a visible focus outline on the indicator when the slotted input is focused', async () => {
    const el = await fixture<DsCheckbox>(html`
      <hl-checkbox><input id="cb" type="checkbox" /><label>Option</label></hl-checkbox>
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
