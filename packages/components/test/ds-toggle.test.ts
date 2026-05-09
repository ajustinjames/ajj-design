import { fixture, html, expect } from '@open-wc/testing';
import type { DsToggle } from '../src/ds-toggle/ds-toggle.js';
import '../src/ds-toggle/ds-toggle.js';

describe('ds-toggle', () => {
  it('defaults checked to false', async () => {
    const el = await fixture<DsToggle>(html`
      <ds-toggle><input type="checkbox" /></ds-toggle>
    `);
    expect(el.checked).to.be.false;
  });

  it('reflects checked from native on connect', async () => {
    const el = await fixture<DsToggle>(html`
      <ds-toggle><input type="checkbox" checked /></ds-toggle>
    `);
    expect(el.checked).to.be.true;
    expect(el.hasAttribute('checked')).to.be.true;
  });

  it('re-fires change event on host', async () => {
    const el = await fixture<DsToggle>(html`
      <ds-toggle><input type="checkbox" /></ds-toggle>
    `);
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    const native = el.querySelector<HTMLInputElement>('input')!;
    native.checked = true;
    native.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(fired).to.be.true;
  });

  it('adds role=switch to slotted input if missing', async () => {
    const el = await fixture<DsToggle>(html`
      <ds-toggle><input type="checkbox" /></ds-toggle>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    expect(native.getAttribute('role')).to.equal('switch');
  });
});
