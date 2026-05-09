import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-spinner')
export class DsSpinner extends LitElement {
  static styles = css`
    :host { display: inline-flex; }
    @keyframes ds-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .square {
      background: #FF4F00;
      border-radius: 0;
      animation: ds-spin 800ms steps(8, end) infinite;
    }
    :host([size='sm']) .square { width: 12px; height: 12px; }
    :host([size='md']) .square { width: 20px; height: 20px; }
    :host([size='lg']) .square { width: 32px; height: 32px; }
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
  interface HTMLElementTagNameMap { 'ds-spinner': DsSpinner; }
}
