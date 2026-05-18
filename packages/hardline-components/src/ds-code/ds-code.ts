import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-code')
export class DsCode extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: #1A1A1A;
      color: #F0F0EC;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      padding: 16px;
      border-radius: 0;
      box-shadow: var(--hl-alias-shadow-1, 2px 2px 0px #000000);
      position: relative;
      overflow-x: auto;
    }
    :host([inline]) {
      display: inline;
      background: rgba(255, 79, 0, 0.1);
      color: var(--hl-alias-text-main, #1A1A1A);
      font-size: 12px;
      padding: 1px 4px;
      box-shadow: none;
    }
    .language-label {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #FF4F00;
      pointer-events: none;
    }
  `;

  @property({ type: Boolean, reflect: true }) inline = false;
  @property({ type: String, reflect: true }) language?: string;

  render() {
    return html`
      ${!this.inline && this.language ? html`<span class="language-label">${this.language}</span>` : ''}
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-code': DsCode; }
}
