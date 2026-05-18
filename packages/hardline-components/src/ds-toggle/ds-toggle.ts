import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-toggle')
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
      border: 1px solid var(--hl-toggle-border, var(--hl-alias-surface-border, #1A1A1A));
      background: var(--hl-alias-surface-bg-alt, #F0F0EC);
      border-radius: 0;
      position: relative;
      flex-shrink: 0;
      pointer-events: none;
    }
    :host([checked]) .track {
      background: var(--hl-alias-action-bg-primary, #FF4F00);
      border-color: var(--hl-alias-action-bg-primary, #FF4F00);
    }
    .thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      background: var(--hl-alias-surface-border, #1A1A1A);
      box-shadow: var(--hl-alias-shadow-1, 2px 2px 0px #000000);
      transition: transform 100ms linear;
    }
    :host([checked]) .thumb {
      transform: translateX(16px);
      background: #FFFFFF;
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
  interface HTMLElementTagNameMap { 'hl-toggle': DsToggle; }
}
