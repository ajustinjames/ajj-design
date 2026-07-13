import { fixture, html, expect } from '@open-wc/testing';
import type { DsToggle } from '../src/ds-toggle/ds-toggle.js';
import '../src/ds-toggle/ds-toggle.js';

describe('hl-toggle', () => {
  it('defaults checked to false', async () => {
    const el = await fixture<DsToggle>(html`
      <hl-toggle><input type="checkbox" /></hl-toggle>
    `);
    expect(el.checked).to.be.false;
  });

  it('reflects checked from native on connect', async () => {
    const el = await fixture<DsToggle>(html`
      <hl-toggle><input type="checkbox" checked /></hl-toggle>
    `);
    expect(el.checked).to.be.true;
    expect(el.hasAttribute('checked')).to.be.true;
  });

  it('re-fires change event on host', async () => {
    const el = await fixture<DsToggle>(html`
      <hl-toggle><input type="checkbox" /></hl-toggle>
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
      <hl-toggle><input type="checkbox" /></hl-toggle>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    expect(native.getAttribute('role')).to.equal('switch');
  });

  it('shows a visible focus outline on the track when the slotted input is focused', async () => {
    const el = await fixture<DsToggle>(html`
      <hl-toggle><input type="checkbox" /></hl-toggle>
    `);
    const native = el.querySelector<HTMLInputElement>('input')!;
    native.focus();
    await el.updateComplete;
    const track = el.shadowRoot!.querySelector<HTMLElement>('.track')!;
    const computed = getComputedStyle(track);
    expect(computed.outlineStyle).to.equal('solid');
    expect(computed.outlineWidth).to.not.equal('0px');
  });
});
