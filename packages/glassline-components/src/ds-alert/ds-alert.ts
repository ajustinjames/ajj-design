import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-alert')
export class DsAlert extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      --gl-alert-tone-color: var(--gl-global-color-accent, #0A84FF);
      background: var(--gl-alert-bg, var(--gl-alias-surface-bg, rgba(255, 255, 255, 0.55)));
      border: 1px solid var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35));
      border-left: 3px solid var(--gl-alert-tone-color, #0A84FF);
      border-radius: var(--gl-alert-radius, var(--gl-alias-radius-md, 16px));
      padding: 16px 20px;
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      box-shadow:
        var(--gl-alias-shadow-1, 0 8px 32px rgba(0, 0, 0, 0.12)),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
    }

    :host([tone='info'])    { --gl-alert-tone-color: #0A84FF; }
    :host([tone='success']) { --gl-alert-tone-color: #248A3D; }
    :host([tone='warning']) { --gl-alert-tone-color: #9A6700; }
    :host([tone='error'])   { --gl-alert-tone-color: #D70015; }

    .header {
      font-family: var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif);
      font-size: 13px;
      font-weight: var(--gl-alias-font-weight-bold, 600);
      letter-spacing: -0.01em;
      color: var(--gl-alert-tone-color, #0A84FF);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: var(--gl-alias-radius-full, 999px);
      background: currentColor;
      box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 22%, transparent);
      flex: none;
    }
    .body {
      font-family: var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif);
      font-size: 14px;
      line-height: 1.45;
      color: var(--gl-alias-text-main, #1D1D1F);
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
    return html`
      <div class="header">
        <slot name="header"></slot>
      </div>
      <div class="body"><slot></slot></div>
      <div class="actions"><slot name="actions"></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'gl-alert': DsAlert; }
}
