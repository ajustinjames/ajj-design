import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean | undefined;
}

@customElement('hl-btn')
export class DsBtn extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      transform: translate(0, 0);
      --hl-btn-shadow: var(--hl-alias-shadow-1, 2px 2px 0px #000000);
      transition:
        transform    var(--hl-alias-transition-snappy, 100ms linear),
        box-shadow   var(--hl-alias-transition-snappy, 100ms linear),
        background   var(--hl-alias-transition-smooth, 200ms ease),
        color        var(--hl-alias-transition-smooth, 200ms ease),
        border-color var(--hl-alias-transition-smooth, 200ms ease);
    }

    :host([variant='default']) {
      --hl-btn-bg:           var(--hl-alias-action-bg, #FFFFFF);
      --hl-btn-color:        var(--hl-alias-action-color, #1A1A1A);
      --hl-btn-border-color: var(--hl-alias-action-border, #1A1A1A);
      --hl-btn-border-style: solid;
    }
    :host([variant='primary']) {
      --hl-btn-bg:           var(--hl-alias-action-bg-primary, #FF4F00);
      --hl-btn-color:        var(--hl-alias-action-color-primary, #FFFFFF);
      --hl-btn-border-color: var(--hl-alias-action-bg-primary, #FF4F00);
      --hl-btn-border-style: solid;
    }
    :host([variant='ghost']) {
      --hl-btn-bg:           transparent;
      --hl-btn-shadow:       none;
      --hl-btn-border-style: dashed;
      --hl-btn-color:        var(--hl-alias-action-color, #1A1A1A);
      --hl-btn-border-color: var(--hl-alias-action-border, #1A1A1A);
    }

    :host([size='md']) {
      --hl-btn-padding-x: var(--hl-alias-action-padding-x, 16px);
      --hl-btn-padding-y: var(--hl-alias-action-padding-y, 12px);
      --hl-btn-font-size: var(--hl-alias-font-size-btn, 12px);
    }
    :host([size='sm']) {
      --hl-btn-padding-x: var(--hl-alias-action-padding-x-sm, 12px);
      --hl-btn-padding-y: var(--hl-alias-action-padding-y-sm, 4px);
      --hl-btn-font-size: var(--hl-alias-font-size-btn-sm, 10px);
    }

    :host(:hover),
    :host(:has(*:focus-visible)) {
      transform: translate(-1px, -1px);
      --hl-btn-shadow: var(--hl-alias-shadow-2, 4px 4px 0px #000000);
    }

    :host(:has(*:active)) {
      transform: translate(1px, 1px);
      --hl-btn-shadow: var(--hl-alias-shadow-0, 1px 1px 0px #000000);
    }

    :host([variant='ghost']:has(*:active)) {
      transform: translate(0, 0);
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.4;
      cursor: not-allowed;
    }
    :host([disabled]) ::slotted(*) {
      box-shadow: none;
      cursor: not-allowed;
    }

    ::slotted(*) {
      font-family: var(--hl-btn-font, var(--hl-alias-font-technical, 'JetBrains Mono', monospace));
      font-size:   var(--hl-btn-font-size, 12px);
      font-weight: var(--hl-btn-font-weight, var(--hl-alias-font-weight-bold, 600));
      text-transform: uppercase;
      border-radius: 0;
      border: 1px solid var(--hl-btn-border-color, #1A1A1A);
      border-style: var(--hl-btn-border-style, solid);
      background: var(--hl-btn-bg, #FFFFFF);
      color: var(--hl-btn-color, #1A1A1A);
      padding: var(--hl-btn-padding-y, 12px) var(--hl-btn-padding-x, 16px);
      box-shadow: var(--hl-btn-shadow);
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
  `;

  @property({ type: String, reflect: true }) variant: 'default' | 'primary' | 'ghost' = 'default';
  @property({ type: String, reflect: true }) size: 'sm' | 'md' = 'md';
  @property({ type: Boolean, reflect: true }) disabled = false;

  connectedCallback(): void {
    super.connectedCallback();
    if (globalThis.__DEV__ !== false && this.disabled) {
      const native = this.querySelector<HTMLElement>('button, input, a');
      if (native && !native.hasAttribute('disabled')) {
        console.warn('<hl-btn>: `disabled` set on shell but slotted native missing `disabled`. Keep them in sync.');
      }
    }
  }

  render() {
    return html`
      <div part="root" style="display:contents">
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hl-btn': DsBtn;
  }
}
