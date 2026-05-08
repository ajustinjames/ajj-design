import { fixture, html, expect } from '@open-wc/testing';
import type { DsSpinner } from '../src/ds-spinner/ds-spinner.js';
import '../src/ds-spinner/ds-spinner.js';

describe('ds-spinner', () => {
  it('has role=status in shadow DOM', async () => {
    const el = await fixture<DsSpinner>(html`<ds-spinner></ds-spinner>`);
    const inner = el.shadowRoot!.querySelector('[role="status"]');
    expect(inner).to.exist;
  });

  it('defaults size to md', async () => {
    const el = await fixture<DsSpinner>(html`<ds-spinner></ds-spinner>`);
    expect(el.size).to.equal('md');
  });

  it('defaults label to Loading', async () => {
    const el = await fixture<DsSpinner>(html`<ds-spinner></ds-spinner>`);
    expect(el.label).to.equal('Loading');
  });

  it('binds aria-label to label prop', async () => {
    const el = await fixture<DsSpinner>(html`<ds-spinner label="Saving"></ds-spinner>`);
    const inner = el.shadowRoot!.querySelector('[role="status"]')!;
    expect(inner.getAttribute('aria-label')).to.equal('Saving');
  });
});
