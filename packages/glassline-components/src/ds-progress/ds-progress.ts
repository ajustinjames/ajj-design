import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-progress')
export class DsProgress extends LitElement {
  static styles = css`
    :host { display: block; }
    .track {
      display: block;
      width: 100%;
      height: 8px;
      border: 1px solid var(--gl-progress-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      border-radius: var(--gl-alias-radius-full, 999px);
      background: var(--gl-progress-track, var(--gl-alias-surface-bg-alt, rgba(255, 255, 255, 0.40)));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      box-shadow: var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background-color: var(--gl-progress-fill, var(--gl-alias-action-bg-primary, #0A84FF));
      background-image: var(--gl-alias-action-sheen, linear-gradient(180deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0) 55%));
      border-radius: var(--gl-alias-radius-full, 999px);
      transition: width var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1));
    }
    @media (prefers-reduced-motion: reduce) {
      .fill { transition: none; }
    }
    /* The slotted native progress stays in the light DOM for semantics
       (screen readers, form association) but is visually replaced by the
       shadow track/fill, since ::slotted() cannot reach its internal
       pseudo-elements. */
    ::slotted(progress) {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
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
    const pct = this.max > 0 ? Math.min(100, Math.max(0, (this.value / this.max) * 100)) : 0;
    return html`
      <div class="track" part="track" aria-hidden="true">
        <div class="fill" part="fill" style="width: ${pct}%"></div>
      </div>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'gl-progress': DsProgress; }
}
