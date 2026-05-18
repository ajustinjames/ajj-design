import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-tag')
export class DsTag extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: var(--hl-tag-font, var(--hl-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: var(--hl-alias-tracking-wide, 0.05em);
      padding: 2px 8px;
      border-radius: 0;
      border: 1px solid var(--hl-tag-border, var(--hl-alias-surface-border, #1A1A1A));
      color: var(--hl-tag-color, var(--hl-alias-text-main, #1A1A1A));
      background: transparent;
      box-shadow: none;
    }
    ::slotted([slot='dismiss']) {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      font-size: 10px;
      color: inherit;
      line-height: 1;
    }
  `;

  @property({ type: Boolean, reflect: true }) dismissible = false;

  render() {
    return html`
      <slot></slot>
      ${this.dismissible ? html`<slot name="dismiss"></slot>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-tag': DsTag; }
}
