import { fixture, html, expect } from '@open-wc/testing';
import type { DsBreadcrumb } from '../src/ds-breadcrumb/ds-breadcrumb.js';
import '../src/ds-breadcrumb/ds-breadcrumb.js';

describe('ds-breadcrumb', () => {
  it('renders a nav with aria-label=breadcrumb', async () => {
    const el = await fixture<DsBreadcrumb>(html`
      <ds-breadcrumb>
        <li><a href="/">Home</a></li>
        <li><a href="/docs">Docs</a></li>
        <li>Current</li>
      </ds-breadcrumb>
    `);
    const nav = el.shadowRoot!.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).to.equal('breadcrumb');
  });

  it('renders slotted li items', async () => {
    const el = await fixture<DsBreadcrumb>(html`
      <ds-breadcrumb>
        <li id="item1"><a href="/">Home</a></li>
        <li id="item2">Current</li>
      </ds-breadcrumb>
    `);
    expect(el.querySelector('#item1')).to.exist;
    expect(el.querySelector('#item2')).to.exist;
  });
});
