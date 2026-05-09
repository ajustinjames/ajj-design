import { fixture, html, expect } from '@open-wc/testing';
import type { DsSelect } from '../src/ds-select/ds-select.js';
import '../src/ds-select/ds-select.js';

describe('ds-select', () => {
  it('defaults state to default', async () => {
    const el = await fixture<DsSelect>(html`
      <ds-select><select><option>A</option></select></ds-select>
    `);
    expect(el.state).to.equal('default');
  });

  it('defaults disabled to false', async () => {
    const el = await fixture<DsSelect>(html`
      <ds-select><select><option>A</option></select></ds-select>
    `);
    expect(el.disabled).to.be.false;
  });

  it('reflects state attribute', async () => {
    const el = await fixture<DsSelect>(html`
      <ds-select state="error"><select><option>A</option></select></ds-select>
    `);
    expect(el.getAttribute('state')).to.equal('error');
  });

  it('renders slotted select', async () => {
    const el = await fixture<DsSelect>(html`
      <ds-select><select id="inner"><option>A</option></select></ds-select>
    `);
    expect(el.querySelector('#inner')).to.exist;
  });
});
