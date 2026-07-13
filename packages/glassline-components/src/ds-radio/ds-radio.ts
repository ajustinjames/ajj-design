import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-radio')
export class DsRadio extends LitElement {
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
    .indicator {
      width: 16px;
      height: 16px;
      border: 1px solid var(--gl-radio-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      background: var(--gl-radio-bg, var(--gl-alias-surface-bg-strong, rgba(255, 255, 255, 0.72)));
      border-radius: var(--gl-radio-radius, var(--gl-alias-radius-full, 999px));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      backdrop-filter: var(--gl-alias-vibrancy-sm, blur(8px) saturate(160%));
      box-shadow: var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      flex-shrink: 0;
      position: relative;
      pointer-events: none;
      transition:
        background-color var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1)),
        border-color     var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1)),
        box-shadow       var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1));
    }
    :host([checked]) .indicator {
      background: var(--gl-alias-action-bg-primary, #0A84FF);
      border-color: var(--gl-alias-action-bg-primary, #0A84FF);
      box-shadow:
        var(--gl-alias-shadow-0, 0 2px 8px rgba(0, 0, 0, 0.08)),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
    }
    :host([checked]) .indicator::after {
      content: '';
      position: absolute;
      inset: 0;
      margin: auto;
      width: 6px;
      height: 6px;
      border-radius: var(--gl-alias-radius-full, 999px);
      background: #FFFFFF;
    }
    :host(:focus-within) .indicator {
      border-color: var(--gl-global-color-accent, #0A84FF);
      box-shadow:
        var(--gl-alias-shadow-accent, 0 0 0 4px rgba(10, 132, 255, 0.35)),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
    }
    ::slotted(input[type='radio']) {
      opacity: 0;
      position: absolute;
      inset: 0;
      margin: 0;
      cursor: pointer;
      width: 16px;
      height: 16px;
    }
    ::slotted(label) {
      font-family: var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif);
      font-size: 14px;
      letter-spacing: -0.01em;
      color: var(--gl-alias-text-main, #1D1D1F);
      cursor: pointer;
    }
  `;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  #onChange = (e: Event) => {
    this.checked = (e.target as HTMLInputElement).checked;
  };

  connectedCallback(): void {
    super.connectedCallback();
    const native = this.querySelector<HTMLInputElement>('input[type="radio"]');
    if (native) {
      this.checked = native.checked;
      native.addEventListener('change', this.#onChange);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.querySelector<HTMLInputElement>('input[type="radio"]')?.removeEventListener('change', this.#onChange);
  }

  render() {
    return html`
      <div class="indicator"></div>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'gl-radio': DsRadio; }
}
