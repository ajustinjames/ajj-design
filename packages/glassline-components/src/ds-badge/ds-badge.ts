import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-badge')
export class DsBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      font-family: var(--gl-badge-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      font-size: 12px;
      font-weight: var(--gl-alias-font-weight-medium, 510);
      letter-spacing: -0.01em;
      padding: 3px 10px;
      border-radius: var(--gl-badge-radius, var(--gl-alias-radius-full, 999px));
      border: 1px solid var(--gl-badge-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      background: var(--gl-badge-bg, var(--gl-alias-surface-bg-strong, rgba(255, 255, 255, 0.72)));
      color: var(--gl-badge-color, var(--gl-alias-text-main, #1D1D1F));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      box-shadow:
        var(--gl-alias-shadow-0, 0 2px 8px rgba(0, 0, 0, 0.08)),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
    }

    :host([tone='default']) {
      --gl-badge-color: var(--gl-alias-text-main, #1D1D1F);
    }
    :host([tone='accent']) {
      --gl-badge-color: #0A84FF;
      --gl-badge-bg: color-mix(in srgb, #0A84FF 16%, rgba(255, 255, 255, 0.72));
      --gl-badge-border: color-mix(in srgb, #0A84FF 40%, transparent);
    }
    :host([tone='success']) {
      --gl-badge-color: #248A3D;
      --gl-badge-bg: color-mix(in srgb, #30D158 18%, rgba(255, 255, 255, 0.72));
      --gl-badge-border: color-mix(in srgb, #30D158 44%, transparent);
    }
    :host([tone='error']) {
      --gl-badge-color: #D70015;
      --gl-badge-bg: color-mix(in srgb, #FF453A 16%, rgba(255, 255, 255, 0.72));
      --gl-badge-border: color-mix(in srgb, #FF453A 40%, transparent);
    }
    :host([tone='warning']) {
      --gl-badge-color: #9A6700;
      --gl-badge-bg: color-mix(in srgb, #FFD60A 26%, rgba(255, 255, 255, 0.72));
      --gl-badge-border: color-mix(in srgb, #FFD60A 52%, transparent);
    }
  `;

  @property({ type: String, reflect: true }) tone: 'default' | 'accent' | 'success' | 'error' | 'warning' = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'gl-badge': DsBadge; }
}
