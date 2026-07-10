import { fixture, html, expect } from '@open-wc/testing';
import type { DsTooltip } from '../src/ds-tooltip/ds-tooltip.js';
import '../src/ds-tooltip/ds-tooltip.js';

describe('gl-tooltip', () => {
  it('is hidden by default', async () => {
    const el = await fixture<DsTooltip>(html`<gl-tooltip for="t-anchor">tip</gl-tooltip>`);
    const surface = el.shadowRoot!.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(getComputedStyle(surface).display).to.equal('none');
  });

  it('defaults placement to top', async () => {
    const el = await fixture<DsTooltip>(html`<gl-tooltip>tip</gl-tooltip>`);
    expect(el.placement).to.equal('top');
  });

  it('shows on mouseenter of anchor and hides on mouseleave', async () => {
    const btn = document.createElement('button');
    btn.id = 'tip-anchor';
    document.body.appendChild(btn);
    const el = await fixture<DsTooltip>(html`<gl-tooltip for="tip-anchor">hint</gl-tooltip>`);
    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;
    const surface = el.shadowRoot!.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(getComputedStyle(surface).display).not.to.equal('none');
    btn.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await el.updateComplete;
    expect(getComputedStyle(surface).display).to.equal('none');
    btn.remove();
  });

  it('positions top placement above the anchor', async () => {
    const btn = document.createElement('button');
    btn.id = 'tip-position-anchor';
    btn.getBoundingClientRect = () => ({
      x: 40,
      y: 100,
      top: 100,
      right: 140,
      bottom: 124,
      left: 40,
      width: 100,
      height: 24,
      toJSON: () => {},
    });
    document.body.appendChild(btn);

    const el = await fixture<DsTooltip>(html`<gl-tooltip for="tip-position-anchor">hint</gl-tooltip>`);
    const surface = el.shadowRoot!.querySelector<HTMLElement>('[role="tooltip"]')!;
    surface.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      top: 0,
      right: 48,
      bottom: 20,
      left: 0,
      width: 48,
      height: 20,
      toJSON: () => {},
    });

    btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await el.updateComplete;
    await el.updateComplete;

    expect(surface.style.top).to.equal('72px');
    btn.remove();
  });
});
