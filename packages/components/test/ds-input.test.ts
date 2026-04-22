import { fixture, html, expect } from '@open-wc/testing';
import type { DsInput } from '../src/ds-input/ds-input.js';
import '../src/ds-input/ds-input.js';

describe('ds-input', () => {
  it('has display: flex', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input><input type="text" /></ds-input>
    `);
    expect(getComputedStyle(el).display).to.equal('flex');
  });

  it('defaults state to "default"', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input><input type="text" /></ds-input>
    `);
    expect(el.state).to.equal('default');
  });

  it('defaults density to "default"', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input><input type="text" /></ds-input>
    `);
    expect(el.density).to.equal('default');
  });

  it('reflects state attribute', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input state="error"><input type="text" /></ds-input>
    `);
    expect(el.getAttribute('state')).to.equal('error');
  });

  it('reflects density="compact" attribute', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input density="compact"><input type="text" /></ds-input>
    `);
    expect(el.getAttribute('density')).to.equal('compact');
  });

  it('reflects data-type="clinical" attribute', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input data-type="clinical"><input type="text" /></ds-input>
    `);
    expect(el.getAttribute('data-type')).to.equal('clinical');
  });

  it('renders slotted input in default slot', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input><input id="native" type="text" /></ds-input>
    `);
    expect(el.querySelector('#native')).to.exist;
  });

  it('renders label slot content', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input>
        <label slot="label" id="lbl">Field</label>
        <input type="text" />
      </ds-input>
    `);
    const lbl = el.querySelector('#lbl');
    expect(lbl).to.exist;
  });

  it('renders unit slot content', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input>
        <input type="text" />
        <span slot="unit" id="unit">mg</span>
      </ds-input>
    `);
    expect(el.querySelector('#unit')).to.exist;
  });

  it('label-for wires input id via connectedCallback', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input label-for="dose">
        <input type="text" />
      </ds-input>
    `);
    const input = el.querySelector('input')!;
    expect(input.id).to.equal('dose');
  });

  it('label-for wires label[for] via connectedCallback', async () => {
    const el = await fixture<DsInput>(html`
      <ds-input label-for="sys-key">
        <label slot="label">Key</label>
        <input type="text" />
      </ds-input>
    `);
    const label = el.querySelector('label')!;
    expect(label.getAttribute('for')).to.equal('sys-key');
  });

  it('emits dev warning when label present but no association', async () => {
    const warnings: string[] = [];
    const orig = console.warn;
    console.warn = (...args: unknown[]) => warnings.push(String(args[0]));
    (globalThis as Record<string, unknown>).__DEV__ = true;

    await fixture<DsInput>(html`
      <ds-input>
        <label slot="label">No id</label>
        <input type="text" />
      </ds-input>
    `);

    console.warn = orig;
    expect(warnings.some(w => w.includes('ds-input'))).to.be.true;
  });
});
