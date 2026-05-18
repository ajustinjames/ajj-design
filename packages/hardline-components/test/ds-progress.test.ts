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
});
