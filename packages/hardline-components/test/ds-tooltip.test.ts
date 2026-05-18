import { fixture, html, expect } from '@open-wc/testing';
import type { DsTooltip } from '../src/ds-tooltip/ds-tooltip.js';
import '../src/ds-tooltip/ds-tooltip.js';

describe('hl-tooltip', () => {
  it('is hidden by default', async () => {
    const el = await fixture<DsTooltip>(html`<hl-tooltip for="t-anchor">tip</hl-tooltip>`);
    const surface = el.shadowRoot!.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(getComputedStyle(surface).display).to.equal('none');
  });

  it('defaults placement to top', async () => {
    const el = await fixture<DsTooltip>(html`<hl-tooltip>tip</hl-tooltip>`);
    expect(el.placement).to.equal('top');
  });

  it('shows on mouseenter of anchor and hides on mouseleave', async () => {
    const btn = document.createElement('button');
    btn.id = 'tip-anchor';
    document.body.appendChild(btn);
    const el = await fixture<DsTooltip>(html`<hl-tooltip for="tip-anchor">hint</hl-tooltip>`);
    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;
    const surface = el.shadowRoot!.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(getComputedStyle(surface).display).not.to.equal('none');
    btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await el.updateComplete;
    expect(getComputedStyle(surface).display).to.equal('none');
    btn.remove();
  });
});
