import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-select')
export class DsSelect extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: stretch;
      overflow: hidden;
      border: 1px solid var(--gl-select-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      border-radius: var(--gl-select-radius, var(--gl-alias-radius-sm, 10px));
      background: var(--gl-select-bg, var(--gl-alias-surface-bg-strong, rgba(255, 255, 255, 0.72)));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      box-shadow: var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      transition:
        background-color var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1)),
        border-color     var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1)),
        box-shadow       var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1));
    }
    :host(:focus-within) {
      border-color: var(--gl-global-color-accent, #0A84FF);
      box-shadow:
        var(--gl-select-shadow-focus, var(--gl-alias-shadow-accent, 0 0 0 4px rgba(10, 132, 255, 0.35))),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
    }
    :host([state='error']) {
      border-color: var(--gl-select-border-error, var(--gl-alias-status-error, #FF453A));
    }
    :host([state='error']:focus-within) {
      border-color: var(--gl-select-border-error, var(--gl-alias-status-error, #FF453A));
      box-shadow:
        var(--gl-select-shadow-error, var(--gl-alias-shadow-error, 0 0 0 4px rgba(255, 69, 58, 0.30))),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
    }
    :host([state='success']) {
      border-color: var(--gl-select-border-success, var(--gl-alias-status-success, #30D158));
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
      font-family: var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif);
      font-size: 15px;
      letter-spacing: -0.01em;
      color: var(--gl-alias-text-main, #1D1D1F);
      padding: var(--gl-alias-input-padding, 10px);
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
  interface HTMLElementTagNameMap { 'gl-select': DsSelect; }
}
