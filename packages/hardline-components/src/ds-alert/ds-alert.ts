import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const TONE_COLOR_VARS: Record<string, string> = {
  info: 'var(--hl-alias-status-info, #1A1A1A)',
  success: 'var(--hl-alias-status-success, #1A6B1A)',
  warning: 'var(--hl-alias-status-warning, #B85C00)',
  error: 'var(--hl-alias-status-error, #CC0000)',
};

@customElement('hl-alert')
export class DsAlert extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--hl-alert-bg, var(--hl-alias-surface-bg, #FFFFFF));
      border: 1px solid var(--hl-alias-surface-border, #1A1A1A);
      border-left: 4px solid var(--hl-alert-tone-color, #1A1A1A);
      padding: 16px;
      box-shadow: var(--hl-alias-shadow-1, 2px 2px 0px #000000);
    }
    .header {
      font-family: var(--hl-alias-font-technical, 'JetBrains Mono', monospace);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--hl-alert-tone-color, #1A1A1A);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header::before {
      content: '■';
      font-size: 10px;
    }
    .body {
      font-family: var(--hl-alias-font-ui, 'Inter', system-ui, sans-serif);
      font-size: 14px;
      color: var(--hl-alias-text-main, #1A1A1A);
    }
    .actions {
      margin-top: 12px;
    }
  `;

  @property({ type: String, reflect: true }) tone: 'info' | 'success' | 'warning' | 'error' = 'info';

  constructor() {
    super();
    this.setAttribute('role', 'alert');
  }

  render() {
    const color = TONE_COLOR_VARS[this.tone] ?? TONE_COLOR_VARS.info;
    return html`
      <div class="header" style="--hl-alert-tone-color:${color}">
        <slot name="header"></slot>
      </div>
      <div class="body"><slot></slot></div>
      <div class="actions"><slot name="actions"></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-alert': DsAlert; }
}
