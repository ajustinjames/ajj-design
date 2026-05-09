import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('ds-breadcrumb')
export class DsBreadcrumb extends LitElement {
  @state() private _items: Element[] = [];

  static styles = css`
    :host { display: block; }
    nav ol {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 0;
      font-family: var(--ds-alias-font-technical, 'JetBrains Mono', monospace);
      font-size: 11px;
    }
    li:not(.sep) {
      display: flex;
      align-items: center;
      color: var(--ds-alias-text-muted, #666666);
    }
    li:not(.sep) a {
      color: inherit;
      text-decoration: none;
    }
    li:not(.sep) a:hover {
      text-decoration: underline;
    }
    li:last-child {
      color: var(--ds-alias-text-main, #1A1A1A);
    }
    .sep {
      padding: 0 4px;
      color: var(--ds-alias-text-muted, #666666);
      user-select: none;
    }
  `;

  private _onSlotChange(e: Event) {
    this._items = (e.target as HTMLSlotElement).assignedElements({ flatten: true });
  }

  render() {
    return html`
      <slot @slotchange=${this._onSlotChange} style="display:none"></slot>
      <nav aria-label="breadcrumb">
        <ol>
          ${this._items.map((item, i) => html`
            ${i > 0 ? html`<li class="sep" aria-hidden="true">/</li>` : nothing}
            ${item.cloneNode(true)}
          `)}
        </ol>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ds-breadcrumb': DsBreadcrumb; }
}
