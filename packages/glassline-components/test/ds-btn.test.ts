import { fixture, html, expect } from '@open-wc/testing';
import type { DsBtn } from '../src/ds-btn/ds-btn.js';
import '../src/ds-btn/ds-btn.js';

describe('gl-btn', () => {
  it('has display: inline-block', async () => {
    const el = await fixture<DsBtn>(html`<gl-btn><button>OK</button></gl-btn>`);
    expect(getComputedStyle(el).display).to.equal('inline-block');
  });

  it('defaults variant to "default"', async () => {
    const el = await fixture<DsBtn>(html`<gl-btn><button>OK</button></gl-btn>`);
    expect(el.variant).to.equal('default');
  });

  it('defaults size to "md"', async () => {
    const el = await fixture<DsBtn>(html`<gl-btn><button>OK</button></gl-btn>`);
    expect(el.size).to.equal('md');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<DsBtn>(html`<gl-btn variant="primary"><button>OK</button></gl-btn>`);
    expect(el.getAttribute('variant')).to.equal('primary');
  });

  it('reflects size attribute', async () => {
    const el = await fixture<DsBtn>(html`<gl-btn size="sm"><button>OK</button></gl-btn>`);
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('renders slotted button in default slot', async () => {
    const el = await fixture<DsBtn>(html`
      <gl-btn><button id="inner">Action</button></gl-btn>
    `);
    const btn = el.querySelector('#inner');
    expect(btn).to.exist;
    expect(btn!.textContent).to.equal('Action');
  });

  it('renders prefix and suffix icon slots', async () => {
    const el = await fixture<DsBtn>(html`
      <gl-btn>
        <span slot="prefix" id="pfx">→</span>
        <button>Go</button>
        <span slot="suffix" id="sfx">↗</span>
      </gl-btn>
    `);
    expect(el.querySelector('#pfx')).to.exist;
    expect(el.querySelector('#sfx')).to.exist;
  });

  it('ghost variant reflects attribute', async () => {
    const el = await fixture<DsBtn>(html`<gl-btn variant="ghost"><button>Ghost</button></gl-btn>`);
    expect(el.getAttribute('variant')).to.equal('ghost');
  });

  it('disabled prop reflects attribute', async () => {
    const el = await fixture<DsBtn>(html`<gl-btn disabled><button disabled>OK</button></gl-btn>`);
    expect(el.disabled).to.be.true;
    expect(el.hasAttribute('disabled')).to.be.true;
  });

  it('disabled applies pointer-events:none and readable fallback opacity', async () => {
    const el = await fixture<DsBtn>(html`<gl-btn disabled><button disabled>OK</button></gl-btn>`);
    expect(getComputedStyle(el).pointerEvents).to.equal('none');
    expect(getComputedStyle(el).opacity).to.equal('0.72');
  });

  it('warns when shell disabled but native is not', async () => {
    const warns: string[] = [];
    const orig = console.warn;
    console.warn = (...args: unknown[]) => warns.push(String(args[0]));
    await fixture<DsBtn>(html`<gl-btn disabled><button>OK</button></gl-btn>`);
    console.warn = orig;
    expect(warns.some(w => w.includes('gl-btn'))).to.be.true;
  });
});
