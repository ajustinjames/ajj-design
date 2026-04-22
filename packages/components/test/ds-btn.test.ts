import { fixture, html, expect } from '@open-wc/testing';
import type { DsBtn } from '../src/ds-btn/ds-btn.js';
import '../src/ds-btn/ds-btn.js';

describe('ds-btn', () => {
  it('has display: inline-block', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn><button>OK</button></ds-btn>`);
    expect(getComputedStyle(el).display).to.equal('inline-block');
  });

  it('defaults variant to "default"', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn><button>OK</button></ds-btn>`);
    expect(el.variant).to.equal('default');
  });

  it('defaults size to "md"', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn><button>OK</button></ds-btn>`);
    expect(el.size).to.equal('md');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn variant="primary"><button>OK</button></ds-btn>`);
    expect(el.getAttribute('variant')).to.equal('primary');
  });

  it('reflects size attribute', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn size="sm"><button>OK</button></ds-btn>`);
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('renders slotted button in default slot', async () => {
    const el = await fixture<DsBtn>(html`
      <ds-btn><button id="inner">Action</button></ds-btn>
    `);
    const btn = el.querySelector('#inner');
    expect(btn).to.exist;
    expect(btn!.textContent).to.equal('Action');
  });

  it('renders prefix and suffix icon slots', async () => {
    const el = await fixture<DsBtn>(html`
      <ds-btn>
        <span slot="prefix" id="pfx">→</span>
        <button>Go</button>
        <span slot="suffix" id="sfx">↗</span>
      </ds-btn>
    `);
    expect(el.querySelector('#pfx')).to.exist;
    expect(el.querySelector('#sfx')).to.exist;
  });

  it('ghost variant reflects attribute', async () => {
    const el = await fixture<DsBtn>(html`<ds-btn variant="ghost"><button>Ghost</button></ds-btn>`);
    expect(el.getAttribute('variant')).to.equal('ghost');
  });
});
