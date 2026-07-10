import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-link')
export class DsLink extends LitElement {
  static styles = css`
    :host {
      display: inline;
    }
    ::slotted(a) {
      font-family: var(--gl-link-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      color: var(--gl-link-color, var(--gl-alias-text-main, #1D1D1F));
      text-decoration: none;
      text-underline-offset: 2px;
      border-radius: var(--gl-alias-radius-xs, 6px);
      transition: color var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1));
    }
    ::slotted(a:hover) {
      text-decoration: underline;
    }
    ::slotted(a:focus-visible) {
      outline: none;
      text-decoration: underline;
      box-shadow: var(--gl-alias-shadow-accent, 0 0 0 4px rgba(10, 132, 255, 0.35));
    }
    :host([tone='muted']) ::slotted(a) {
      color: var(--gl-alias-text-muted, rgba(60, 60, 67, 0.6));
    }
    :host([tone='accent']) ::slotted(a) {
      color: var(--gl-global-color-accent, #0A84FF);
    }
  `;

  @property({ type: String, reflect: true }) tone: 'default' | 'muted' | 'accent' = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'gl-link': DsLink; }
}
