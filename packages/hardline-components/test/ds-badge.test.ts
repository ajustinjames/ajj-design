import { fixture, html, expect } from '@open-wc/testing';
import type { DsBadge } from '../src/ds-badge/ds-badge.js';
import '../src/ds-badge/ds-badge.js';

describe('hl-badge', () => {
  it('defaults tone to default', async () => {
    const el = await fixture<DsBadge>(html`<hl-badge>ACTIVE</hl-badge>`);
    expect(el.tone).to.equal('default');
  });

  it('reflects tone attribute', async () => {
    const el = await fixture<DsBadge>(html`<hl-badge tone="error">FAIL</hl-badge>`);
    expect(el.getAttribute('tone')).to.equal('error');
  });

  it('renders slotted text', async () => {
    const el = await fixture<DsBadge>(html`<hl-badge>STATUS</hl-badge>`);
    expect(el.textContent?.trim()).to.equal('STATUS');
  });
});
