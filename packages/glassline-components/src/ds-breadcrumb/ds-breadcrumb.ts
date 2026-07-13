import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('gl-breadcrumb')
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
      font-family: var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif);
      font-size: 13px;
      letter-spacing: -0.01em;
    }
    li:not(.sep) {
      display: flex;
      align-items: center;
      color: var(--gl-alias-text-muted, rgba(60, 60, 67, 0.6));
    }
    li:not(.sep) a {
      color: inherit;
      text-decoration: none;
      transition: color var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1));
    }
    li:not(.sep) a:hover {
      text-decoration: underline;
      color: var(--gl-alias-text-main, #1D1D1F);
    }
    li:last-child {
      color: var(--gl-alias-text-main, #1D1D1F);
    }
    .sep {
      padding: 0 6px;
      color: var(--gl-alias-text-muted, rgba(60, 60, 67, 0.6));
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
  interface HTMLElementTagNameMap { 'gl-breadcrumb': DsBreadcrumb; }
}
