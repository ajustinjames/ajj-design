import { fixture, html, expect } from '@open-wc/testing';
import type { DsProgress } from '../src/ds-progress/ds-progress.js';
import '../src/ds-progress/ds-progress.js';

describe('hl-progress', () => {
  it('defaults value to 0', async () => {
    const el = await fixture<DsProgress>(html`
      <hl-progress><progress></progress></hl-progress>
    `);
    expect(el.value).to.equal(0);
  });

  it('defaults max to 100', async () => {
    const el = await fixture<DsProgress>(html`
      <hl-progress><progress></progress></hl-progress>
    `);
    expect(el.max).to.equal(100);
  });

  it('writes value and max through to slotted progress', async () => {
    const el = await fixture<DsProgress>(html`
      <hl-progress value="40" max="100"><progress></progress></hl-progress>
    `);
    const native = el.querySelector<HTMLProgressElement>('progress')!;
    expect(native.value).to.equal(40);
    expect(native.max).to.equal(100);
  });

  it('renders a shadow DOM fill bar sized to the value/max ratio', async () => {
    const el = await fixture<DsProgress>(html`
      <hl-progress value="40" max="100"><progress></progress></hl-progress>
    `);
    const fill = el.shadowRoot!.querySelector<HTMLElement>('.fill')!;
    expect(fill).to.exist;
    expect(fill.style.width).to.equal('40%');
  });

  it('gives the fill bar a rendered width proportional to its track once painted', async () => {
    const el = await fixture<DsProgress>(html`
      <hl-progress value="50" max="100" style="width: 200px;">
        <progress></progress>
      </hl-progress>
    `);
    const fill = el.shadowRoot!.querySelector<HTMLElement>('.fill')!;
    const computed = getComputedStyle(fill);
    expect(computed.backgroundColor).to.not.equal('');
    expect(fill.getBoundingClientRect().width).to.equal(100);
  });
});
