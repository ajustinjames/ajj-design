import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-code')
export class DsCode extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--gl-code-bg, var(--gl-alias-surface-bg-alt, rgba(255, 255, 255, 0.40)));
      color: var(--gl-code-color, var(--gl-alias-text-main, #1D1D1F));
      font-family: var(--gl-alias-font-technical, 'SF Mono', ui-monospace, 'JetBrains Mono', monospace);
      font-size: 13px;
      padding: 16px;
      border: 1px solid var(--gl-code-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      border-radius: var(--gl-code-radius, var(--gl-alias-radius-sm, 10px));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      box-shadow: var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      position: relative;
      overflow-x: auto;
    }
    :host([inline]) {
      display: inline;
      font-size: 12px;
      padding: 1px 6px;
      border-radius: var(--gl-alias-radius-xs, 6px);
    }
    .language-label {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: var(--gl-alias-tracking-wide, 0.02em);
      color: var(--gl-global-color-accent, #0A84FF);
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
  interface HTMLElementTagNameMap { 'gl-code': DsCode; }
}
