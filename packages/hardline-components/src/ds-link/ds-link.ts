import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-link')
export class DsLink extends LitElement {
  static styles = css`
    :host {
      display: inline;
    }
    ::slotted(a) {
      font-family: var(--hl-link-font, var(--hl-alias-font-ui, 'Inter', system-ui, sans-serif));
      color: var(--hl-link-color, var(--hl-alias-text-main, #1A1A1A));
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;
      outline-offset: 2px;
      outline: 2px solid transparent;
      border-radius: 0;
    }
    ::slotted(a:hover) {
      text-decoration-thickness: 2px;
    }
    ::slotted(a:focus-visible) {
      outline-color: var(--hl-alias-surface-border, #1A1A1A);
      text-decoration-thickness: 2px;
    }
    :host([tone='muted']) ::slotted(a) {
      color: var(--hl-alias-text-muted, #666666);
    }
    :host([tone='accent']) ::slotted(a) {
      color: #FF4F00;
    }
  `;

  @property({ type: String, reflect: true }) tone: 'default' | 'muted' | 'accent' = 'default';

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-link': DsLink; }
}
