import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ds-breadcrumb')
export class DsBreadcrumb extends LitElement {
  static styles = css`
    :host { display: block; }
    nav ol {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--ds-alias-text-muted, #666666);
    }
    ::slotted(li) {
      display: flex;
      align-items: center;
      color: var(--ds-alias-text-muted, #666666);
    }
    ::slotted(li:last-child) {
      color: var(--ds-alias-text-main, #1A1A1A);
    }
  `;

  render() {
    return html`
      <nav aria-label="breadcrumb">
        <ol><slot></slot></ol>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ds-breadcrumb': DsBreadcrumb; }
}
