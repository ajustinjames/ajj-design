import { fixture, html, expect } from '@open-wc/testing';
import type { DsAlert } from '../src/ds-alert/ds-alert.js';
import '../src/ds-alert/ds-alert.js';

describe('ds-alert', () => {
  it('has role=alert on host', async () => {
    const el = await fixture<DsAlert>(html`<ds-alert tone="info">message</ds-alert>`);
    expect(el.getAttribute('role')).to.equal('alert');
  });

  it('defaults tone to info', async () => {
    const el = await fixture<DsAlert>(html`<ds-alert>message</ds-alert>`);
    expect(el.tone).to.equal('info');
  });

  it('reflects tone attribute', async () => {
    const el = await fixture<DsAlert>(html`<ds-alert tone="error">message</ds-alert>`);
    expect(el.getAttribute('tone')).to.equal('error');
  });

  it('renders header slot', async () => {
    const el = await fixture<DsAlert>(html`
      <ds-alert><span slot="header" id="hdr">Alert Title</span><p>body</p></ds-alert>
    `);
    expect(el.querySelector('#hdr')).to.exist;
  });
});
