import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-card')
export class DsCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      font-family: var(--gl-card-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      color: var(--gl-alias-text-main, #1D1D1F);
      background: var(--gl-card-bg, var(--gl-alias-surface-bg, rgba(255, 255, 255, 0.55)));
      border: var(--gl-card-border-width, 1px) solid var(--gl-card-border-color, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      padding: var(--gl-card-padding, var(--gl-alias-surface-padding, 24px));
      border-radius: var(--gl-card-radius, var(--gl-alias-surface-radius, var(--gl-alias-radius-md, 16px)));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      box-shadow:
        var(--gl-card-shadow, var(--gl-alias-shadow-1, 0 8px 32px rgba(0, 0, 0, 0.12))),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      transition:
        transform  var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1)),
        box-shadow var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1));
    }

    :host([elevation='1']) { --gl-card-shadow: var(--gl-alias-shadow-1, 0 8px 32px rgba(0, 0, 0, 0.12)); }
    :host([elevation='2']) { --gl-card-shadow: var(--gl-alias-shadow-2, 0 16px 48px rgba(0, 0, 0, 0.18)); }
    :host([elevation='3']) { --gl-card-shadow: var(--gl-alias-shadow-3, 0 24px 64px rgba(0, 0, 0, 0.24)); }

    :host([interactive]) { cursor: pointer; }
    :host([interactive]:hover),
    :host([interactive]:has(*:focus-visible)) {
      transform: translateY(-2px);
      --gl-card-shadow: var(--gl-alias-shadow-2, 0 16px 48px rgba(0, 0, 0, 0.18));
    }

    @media (prefers-reduced-motion: reduce) {
      :host,
      :host([interactive]:hover) {
        transition: none;
        transform: none;
      }
    }
  `;

  @property({ type: Number, reflect: true }) elevation: 1 | 2 | 3 = 1;
  @property({ type: Boolean, reflect: true }) interactive = false;

  render() {
    return html`
      <div part="root">
        <slot name="header"></slot>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gl-card': DsCard;
  }
}
