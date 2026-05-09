import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-select')
export class DsSelect extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: stretch;
      border: 1px solid var(--ds-select-border, var(--ds-alias-surface-border, #1A1A1A));
      background: var(--ds-select-bg, var(--ds-alias-surface-bg-alt, #F0F0EC));
      box-shadow: none;
      transition:
        border-color var(--ds-alias-transition-smooth, 200ms ease),
        box-shadow var(--ds-alias-transition-smooth, 200ms ease);
    }
    :host(:focus-within) {
      border-color: #FF4F00;
      box-shadow: var(--ds-alias-shadow-accent, 2px 2px 0px #FF4F00);
    }
    :host([state='error']) {
      border-color: var(--ds-alias-status-error, #CC0000);
    }
    :host([state='error']:focus-within) {
      box-shadow: var(--ds-alias-shadow-error, 2px 2px 0px #CC0000);
    }
    :host([state='success']) {
      border-color: var(--ds-alias-status-success, #1A6B1A);
    }
    :host([disabled]) {
      pointer-events: none;
      opacity: 0.4;
      cursor: not-allowed;
    }
    ::slotted(select) {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--ds-alias-font-technical, 'JetBrains Mono', monospace);
      font-size: 13px;
      color: var(--ds-alias-text-main, #1A1A1A);
      padding: var(--ds-alias-input-padding, 8px);
      cursor: pointer;
      appearance: auto;
    }
  `;

  @property({ type: String, reflect: true }) state: 'default' | 'error' | 'success' = 'default';
  @property({ type: String, reflect: true }) placeholder?: string;
  @property({ type: Boolean, reflect: true }) disabled = false;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ds-select': DsSelect; }
}
