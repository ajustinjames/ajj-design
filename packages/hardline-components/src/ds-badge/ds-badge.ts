import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-badge')
export class DsBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--hl-badge-font, var(--hl-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: var(--hl-alias-tracking-wide, 0.05em);
      padding: 2px 6px;
      border-radius: 0;
      border: 1px solid var(--hl-badge-border, currentColor);
      box-shadow: none;
    }
    :host([tone='default']) {
      color: var(--hl-alias-text-main, #1A1A1A);
      background: transparent;
    }
    :host([tone='accent']) {
      color: #FF4F00;
      border-color: #FF4F00;
    }
    :host([tone='success']) {
      color: var(--hl-alias-status-success, #1A6B1A);
      border-color: var(--hl-alias-status-success, #1A6B1A);
    }
    :host([tone='error']) {
      color: var(--hl-alias-status-error, #CC0000);
      border-color: var(--hl-alias-status-error, #CC0000);
    }
    :host([tone='warning']) {
      color: var(--hl-alias-status-warning, #B85C00);
      border-color: var(--hl-alias-status-warning, #B85C00);
    }
  `;

  @property({ type: String, reflect: true }) tone: 'default' | 'accent' | 'success' | 'error' | 'warning' = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-badge': DsBadge; }
}
