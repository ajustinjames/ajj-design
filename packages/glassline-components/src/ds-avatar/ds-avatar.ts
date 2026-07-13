import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const SIZES: Record<string, string> = { sm: '24px', md: '40px', lg: '64px' };

@customElement('gl-avatar')
export class DsAvatar extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--gl-avatar-radius, var(--gl-alias-radius-full, 999px));
      border: 1px solid var(--gl-avatar-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      box-shadow:
        var(--gl-alias-shadow-0, 0 2px 8px rgba(0, 0, 0, 0.08)),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      overflow: hidden;
      background: var(--gl-avatar-bg, var(--gl-alias-surface-bg-strong, rgba(255, 255, 255, 0.72)));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      font-family: var(--gl-alias-font-technical, 'SF Mono', ui-monospace, 'JetBrains Mono', monospace);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: var(--gl-alias-tracking-wide, 0.02em);
      color: var(--gl-alias-text-main, #1D1D1F);
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
  interface HTMLElementTagNameMap { 'gl-avatar': DsAvatar; }
}
