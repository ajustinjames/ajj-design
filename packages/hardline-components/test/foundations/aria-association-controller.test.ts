import { fixture, html, expect } from '@open-wc/testing';
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../../src/foundations/aria-association-controller.js';

// Minimal host element for testing the controller
@customElement('test-host')
class TestHost extends LitElement {
  @property({ type: String }) for?: string;

  #aria = new AriaAssociationController(this, {
    attribute: 'aria-labelledby',
    target: () => this.for,
  });
}

describe('AriaAssociationController', () => {
  it('mints an id on host if none is set', async () => {
    const el = await fixture<TestHost>(html`<test-host></test-host>`);
    expect(el.id).to.match(/^test-host-/);
  });

  it('does NOT overwrite an existing host id', async () => {
    const el = await fixture<TestHost>(html`<test-host id="my-id"></test-host>`);
    expect(el.id).to.equal('my-id');
  });

  it('writes aria-labelledby on the target with the host id', async () => {
    await fixture(html`
      <div>
        <test-host id="lbl" for="inp"></test-host>
        <input id="inp" />
      </div>
    `);
    const input = document.querySelector<HTMLInputElement>('input')!;
    expect(input.getAttribute('aria-labelledby')).to.include('lbl');
  });

  it('appends host id to existing aria-labelledby without duplication', async () => {
    await fixture(html`
      <div>
        <test-host id="lbl2" for="inp2"></test-host>
        <input id="inp2" aria-labelledby="existing" />
      </div>
    `);
    const input = document.querySelector<HTMLInputElement>('#inp2')!;
    const tokens = input.getAttribute('aria-labelledby')!.split(' ');
    expect(tokens).to.include('lbl2');
    expect(tokens).to.include('existing');
    expect(tokens.filter(t => t === 'lbl2').length).to.equal(1);
  });

  it('removes host id token on disconnect', async () => {
    const container = await fixture<HTMLDivElement>(html`
      <div>
        <test-host id="lbl3" for="inp3"></test-host>
        <input id="inp3" />
      </div>
    `);
    const input = container.querySelector<HTMLInputElement>('#inp3')!;
    const host = container.querySelector<TestHost>('test-host')!;
    expect(input.getAttribute('aria-labelledby')).to.include('lbl3');
    host.remove();
    expect(input.getAttribute('aria-labelledby') ?? '').to.not.include('lbl3');
  });
});
