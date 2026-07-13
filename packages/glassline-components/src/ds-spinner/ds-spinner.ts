import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-spinner')
export class DsSpinner extends LitElement {
  static styles = css`
    :host { display: inline-flex; }
    @keyframes gl-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .square {
      box-sizing: border-box;
      border-radius: var(--gl-alias-radius-full, 999px);
      border: 2px solid var(--gl-spinner-track, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      border-top-color: var(--gl-spinner-accent, var(--gl-global-color-accent, #0A84FF));
      box-shadow: var(--gl-alias-shadow-0, 0 2px 8px rgba(0, 0, 0, 0.08));
      animation: gl-spin 800ms cubic-bezier(0.32, 0.72, 0, 1) infinite;
    }
    :host([size='sm']) .square { width: 12px; height: 12px; }
    :host([size='md']) .square { width: 20px; height: 20px; }
    :host([size='lg']) .square { width: 32px; height: 32px; border-width: 3px; }

    @media (prefers-reduced-motion: reduce) {
      .square { animation-duration: 2400ms; animation-timing-function: linear; }
    }
  `;

  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';
  @property({ type: String }) label = 'Loading';

  render() {
    return html`
      <div role="status" aria-label="${this.label}">
        <div class="square"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'gl-spinner': DsSpinner; }
}
