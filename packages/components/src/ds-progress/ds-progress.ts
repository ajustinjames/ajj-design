import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-progress')
export class DsProgress extends LitElement {
  static styles = css`
    :host { display: block; }
    ::slotted(progress) {
      appearance: none;
      -webkit-appearance: none;
      display: block;
      width: 100%;
      height: 4px;
      border: none;
      background: var(--ds-alias-surface-bg-alt, #F0F0EC);
      border-left: 4px solid var(--ds-alias-surface-border, #1A1A1A);
    }
    ::slotted(progress::-webkit-progress-bar) {
      background: var(--ds-alias-surface-bg-alt, #F0F0EC);
    }
    ::slotted(progress::-webkit-progress-value) {
      background: #FF4F00;
    }
    ::slotted(progress::-moz-progress-bar) {
      background: #FF4F00;
    }
  `;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) max = 100;

  updated(): void {
    const native = this.querySelector<HTMLProgressElement>('progress');
    if (native) {
      native.value = this.value;
      native.max = this.max;
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ds-progress': DsProgress; }
}
