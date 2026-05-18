import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const SIZES: Record<string, string> = { sm: '24px', md: '40px', lg: '64px' };

@customElement('hl-avatar')
export class DsAvatar extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0;
      border: 1px solid var(--hl-alias-surface-border, #1A1A1A);
      box-shadow: var(--hl-alias-shadow-1, 2px 2px 0px #000000);
      overflow: hidden;
      background: var(--hl-alias-surface-bg-alt, #F0F0EC);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--hl-alias-text-main, #1A1A1A);
    }
    ::slotted(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .initials { pointer-events: none; }
    slot[name='image'] { display: contents; }
  `;

  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';
  @property({ type: String }) initials?: string;
  @state() private _mode: 'image' | 'initials' | 'empty' = 'empty';

  connectedCallback(): void {
    super.connectedCallback();
    this.#updateSize();
  }

  updated(): void {
    this.#updateSize();
  }

  #updateSize(): void {
    const s = SIZES[this.size] ?? '40px';
    this.style.width = s;
    this.style.height = s;
  }

  #onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const hasImage = slot.assignedElements().length > 0;
    this._mode = hasImage ? 'image' : this.initials ? 'initials' : 'empty';
    this.setAttribute('data-mode', this._mode);
  }

  willUpdate(): void {
    if (this._mode !== 'image') {
      this._mode = this.initials ? 'initials' : 'empty';
      this.setAttribute('data-mode', this._mode);
    }
  }

  render() {
    return html`
      <slot name="image" @slotchange=${this.#onSlotChange}></slot>
      ${this._mode === 'initials' ? html`<span class="initials">${this.initials}</span>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-avatar': DsAvatar; }
}
