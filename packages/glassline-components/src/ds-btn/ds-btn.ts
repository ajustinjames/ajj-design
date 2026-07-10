import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean | undefined;
}

@customElement('gl-btn')
export class DsBtn extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      transform: translateY(0);
      --gl-btn-shadow: var(--gl-alias-shadow-1, 0 8px 32px rgba(0, 0, 0, 0.12));
      transition:
        transform  var(--gl-alias-transition-snappy, 150ms cubic-bezier(0.32, 0.72, 0, 1)),
        box-shadow var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1)),
        filter     var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1));
    }

    :host([variant='default']) {
      --gl-btn-bg:           var(--gl-alias-action-bg, rgba(255, 255, 255, 0.72));
      --gl-btn-color:        var(--gl-alias-action-color, #1D1D1F);
      --gl-btn-border-color: var(--gl-alias-action-border, rgba(255, 255, 255, 0.35));
    }
    :host([variant='primary']) {
      --gl-btn-bg:           var(--gl-alias-action-bg-primary, #0A84FF);
      --gl-btn-color:        var(--gl-alias-action-color-primary, #FFFFFF);
      --gl-btn-border-color: rgba(255, 255, 255, 0.25);
      --gl-btn-shadow:       var(--gl-alias-action-shadow-primary, var(--gl-alias-shadow-1, 0 8px 32px rgba(0, 0, 0, 0.12)));
    }
    :host([variant='ghost']) {
      --gl-btn-bg:           transparent;
      --gl-btn-shadow:       none;
      --gl-btn-sheen:        none;
      --gl-btn-color:        var(--gl-alias-action-color, #1D1D1F);
      --gl-btn-border-color: transparent;
    }

    :host([size='md']) {
      --gl-btn-padding-x: var(--gl-alias-action-padding-x, 20px);
      --gl-btn-padding-y: var(--gl-alias-action-padding-y, 11px);
      --gl-btn-font-size: var(--gl-alias-font-size-btn, 14px);
    }
    :host([size='sm']) {
      --gl-btn-padding-x: var(--gl-alias-action-padding-x-sm, 14px);
      --gl-btn-padding-y: var(--gl-alias-action-padding-y-sm, 7px);
      --gl-btn-font-size: var(--gl-alias-font-size-btn-sm, 12px);
    }

    :host(:hover),
    :host(:has(*:focus-visible)) {
      transform: translateY(-1px);
      --gl-btn-shadow: var(--gl-alias-shadow-2, 0 16px 48px rgba(0, 0, 0, 0.18));
    }

    :host(:has(*:active)) {
      transform: translateY(0);
      --gl-btn-shadow: var(--gl-alias-shadow-0, 0 2px 8px rgba(0, 0, 0, 0.08));
    }
    :host([variant='primary']:has(*:active)) {
      --gl-btn-bg: var(--gl-alias-action-bg-pressed, #0060DF);
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: var(--gl-btn-disabled-opacity, var(--gl-alias-action-disabled-opacity, 0.72));
      cursor: not-allowed;
    }
    :host([disabled]) ::slotted(*) {
      box-shadow: none;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      :host,
      :host(:hover),
      :host(:has(*:active)) {
        transition: none;
        transform: none;
      }
    }

    ::slotted(*) {
      position: relative;
      font-family: var(--gl-btn-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      font-size:   var(--gl-btn-font-size, 14px);
      font-weight: var(--gl-btn-font-weight, var(--gl-alias-font-weight-medium, 510));
      letter-spacing: -0.01em;
      border-radius: var(--gl-btn-radius, var(--gl-alias-action-radius, var(--gl-alias-radius-full, 999px)));
      border: 1px solid var(--gl-btn-border-color, rgba(255, 255, 255, 0.35));
      background-color: var(--gl-btn-bg, rgba(255, 255, 255, 0.72));
      background-image: var(--gl-btn-sheen, var(--gl-alias-action-sheen, linear-gradient(180deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0) 55%)));
      color: var(--gl-btn-color, #1D1D1F);
      padding: var(--gl-btn-padding-y, 11px) var(--gl-btn-padding-x, 20px);
      box-shadow:
        var(--gl-btn-shadow),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: var(--gl-alias-space-2, 8px);
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
        console.warn('<gl-btn>: `disabled` set on shell but slotted native missing `disabled`. Keep them in sync.');
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
    'gl-btn': DsBtn;
  }
}
