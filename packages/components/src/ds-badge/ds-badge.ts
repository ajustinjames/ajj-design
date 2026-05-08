import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-badge')
export class DsBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--ds-badge-font, var(--ds-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: var(--ds-alias-tracking-wide, 0.05em);
      padding: 2px 6px;
      border-radius: 0;
      border: 1px solid var(--ds-badge-border, currentColor);
      box-shadow: none;
    }
    :host([tone='default']) {
      color: var(--ds-alias-text-main, #1A1A1A);
      background: transparent;
    }
    :host([tone='accent']) {
      color: #FF4F00;
      border-color: #FF4F00;
    }
    :host([tone='success']) {
      color: var(--ds-alias-status-success, #1A6B1A);
      border-color: var(--ds-alias-status-success, #1A6B1A);
    }
    :host([tone='error']) {
      color: var(--ds-alias-status-error, #CC0000);
      border-color: var(--ds-alias-status-error, #CC0000);
    }
    :host([tone='warning']) {
      color: #B85C00;
      border-color: #B85C00;
    }
  `;

  @property({ type: String, reflect: true }) tone: 'default' | 'accent' | 'success' | 'error' | 'warning' = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ds-badge': DsBadge; }
}
