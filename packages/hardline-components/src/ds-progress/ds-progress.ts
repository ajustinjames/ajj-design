import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-progress')
export class DsProgress extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .track {
      display: block;
      width: 100%;
      height: 4px;
      background: var(--hl-alias-surface-bg-alt, #F0F0EC);
      border-left: 4px solid var(--hl-alias-surface-border, #1A1A1A);
      overflow: hidden;
    }
    .fill {
      display: block;
      height: 100%;
      background: var(--hl-progress-fill, var(--hl-global-color-accent, #FF4F00));
      transition: width var(--hl-alias-transition-smooth, 200ms ease);
    }
    /* The native <progress> element is kept in the light DOM for a11y/value
       semantics only. Its UA-rendered visuals can't be reached with
       ::slotted() + pseudo-elements, so it's visually hidden and the shadow
       DOM track/fill above renders the visible bar. */
    ::slotted(progress) {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
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
    const max = this.max > 0 ? this.max : 100;
    const percent = Math.min(100, Math.max(0, (this.value / max) * 100));
    return html`
      <div class="track">
        <div class="fill" style="width:${percent}%"></div>
      </div>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-progress': DsProgress; }
}
