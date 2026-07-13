import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-select')
export class DsSelect extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: stretch;
      border: 1px solid var(--hl-select-border, var(--hl-alias-surface-border, #1A1A1A));
      background: var(--hl-select-bg, var(--hl-alias-surface-bg-alt, #F0F0EC));
      box-shadow: none;
      transition:
        border-color var(--hl-alias-transition-smooth, 200ms ease),
        box-shadow var(--hl-alias-transition-smooth, 200ms ease);
    }
    :host(:focus-within) {
      border-color: #FF4F00;
      box-shadow: var(--hl-alias-shadow-accent, 2px 2px 0px #FF4F00);
    }
    :host([state='error']) {
      border-color: var(--hl-alias-status-error, #CC0000);
    }
    :host([state='error']:focus-within) {
      box-shadow: var(--hl-alias-shadow-error, 2px 2px 0px #CC0000);
    }
    :host([state='success']) {
      border-color: var(--hl-alias-status-success, #1A6B1A);
    }
    :host([disabled]) {
      pointer-events: none;
      opacity: var(--hl-select-disabled-opacity, var(--hl-alias-action-disabled-opacity, 0.4));
      cursor: not-allowed;
    }
    ::slotted(select) {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--hl-alias-font-technical, 'JetBrains Mono', monospace);
      font-size: 13px;
      color: var(--hl-alias-text-main, #1A1A1A);
      padding: var(--hl-alias-input-padding, 8px);
      cursor: pointer;
      appearance: auto;
    }
  `;

  @property({ type: String, reflect: true }) state: 'default' | 'error' | 'success' = 'default';
  @property({ type: Boolean, reflect: true }) disabled = false;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-select': DsSelect; }
}
