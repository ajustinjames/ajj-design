import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-tag')
export class DsTag extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: var(--gl-tag-font, var(--gl-alias-font-technical, 'SF Mono', ui-monospace, 'JetBrains Mono', monospace));
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: var(--gl-alias-tracking-wide, 0.02em);
      padding: 3px 10px;
      border-radius: var(--gl-tag-radius, var(--gl-alias-radius-full, 999px));
      border: 1px solid var(--gl-tag-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      color: var(--gl-tag-color, var(--gl-alias-text-main, #1D1D1F));
      background: var(--gl-tag-bg, var(--gl-alias-surface-bg-strong, rgba(255, 255, 255, 0.72)));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      box-shadow:
        var(--gl-alias-shadow-0, 0 2px 8px rgba(0, 0, 0, 0.08)),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
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
  interface HTMLElementTagNameMap { 'gl-tag': DsTag; }
}
