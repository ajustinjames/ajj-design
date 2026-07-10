import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-toggle')
export class DsToggle extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      position: relative;
      cursor: pointer;
    }
    :host([disabled]) {
      pointer-events: none;
      opacity: 0.4;
      cursor: not-allowed;
    }
    .track {
      width: 36px;
      height: 20px;
      border: 1px solid var(--gl-toggle-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      background: var(--gl-toggle-bg, var(--gl-alias-surface-bg-alt, rgba(255, 255, 255, 0.40)));
      border-radius: var(--gl-toggle-radius, var(--gl-alias-radius-full, 999px));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      box-shadow: var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      position: relative;
      flex-shrink: 0;
      pointer-events: none;
      transition:
        background-color var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1)),
        border-color     var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1)),
        box-shadow       var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1));
    }
    :host([checked]) .track {
      background: var(--gl-alias-action-bg-primary, #0A84FF);
      border-color: var(--gl-alias-action-bg-primary, #0A84FF);
    }
    :host(:focus-within) .track {
      border-color: var(--gl-global-color-accent, #0A84FF);
      box-shadow:
        var(--gl-alias-shadow-accent, 0 0 0 4px rgba(10, 132, 255, 0.35)),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
    }
    .thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      background: #FFFFFF;
      border-radius: var(--gl-alias-radius-full, 999px);
      box-shadow: var(--gl-alias-shadow-0, 0 2px 8px rgba(0, 0, 0, 0.08));
      transition: transform var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1));
    }
    :host([checked]) .thumb {
      transform: translateX(16px);
    }

    @media (prefers-reduced-motion: reduce) {
      .thumb { transition: none; }
    }
    ::slotted(input[type='checkbox']) {
      opacity: 0;
      position: absolute;
      inset: 0;
      margin: 0;
      cursor: pointer;
      width: 36px;
      height: 20px;
    }
  `;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  #onChange = (e: Event) => {
    this.checked = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  connectedCallback(): void {
    super.connectedCallback();
    const native = this.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (native) {
      this.checked = native.checked;
      native.addEventListener('change', this.#onChange);
      if (!native.hasAttribute('role')) {
        native.setAttribute('role', 'switch');
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.querySelector<HTMLInputElement>('input[type="checkbox"]')?.removeEventListener('change', this.#onChange);
  }

  render() {
    return html`
      <div class="track"><div class="thumb"></div></div>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'gl-toggle': DsToggle; }
}
