import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-checkbox')
export class DsCheckbox extends LitElement {
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
      border: 1px solid var(--hl-checkbox-border, var(--hl-alias-surface-border, #1A1A1A));
      background: var(--hl-alias-surface-bg, #FFFFFF);
      border-radius: 0;
      flex-shrink: 0;
      position: relative;
      pointer-events: none;
    }
    :host([checked]) .indicator {
      background: var(--hl-alias-action-bg-primary, #FF4F00);
      border-color: var(--hl-alias-action-bg-primary, #FF4F00);
      box-shadow: var(--hl-alias-shadow-1, 2px 2px 0px #000000);
    }
    :host([checked]) .indicator::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 5px;
      height: 9px;
      border: 2px solid #FFFFFF;
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }
    :host([indeterminate]) .indicator::after {
      content: '';
      position: absolute;
      left: 3px;
      top: 6px;
      width: 8px;
      height: 2px;
      background: #FFFFFF;
    }
    ::slotted(input[type='checkbox']) {
      opacity: 0;
      position: absolute;
      inset: 0;
      margin: 0;
      cursor: pointer;
      width: 16px;
      height: 16px;
    }
    ::slotted(label) {
      font-family: var(--hl-alias-font-ui, 'Inter', system-ui, sans-serif);
      font-size: 14px;
      color: var(--hl-alias-text-main, #1A1A1A);
      cursor: pointer;
    }
  `;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  #onChange = (e: Event) => {
    const native = e.target as HTMLInputElement;
    this.checked = native.checked;
    this.indeterminate = native.indeterminate;
  };

  connectedCallback(): void {
    super.connectedCallback();
    const native = this.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (native) {
      this.checked = native.checked;
      this.indeterminate = native.indeterminate;
      native.addEventListener('change', this.#onChange);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.querySelector<HTMLInputElement>('input[type="checkbox"]')?.removeEventListener('change', this.#onChange);
  }

  render() {
    return html`
      <div class="indicator"></div>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-checkbox': DsCheckbox; }
}
