import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-btn')
export class DsBtn extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      transform: translate(0, 0);
      --ds-btn-shadow: var(--ds-alias-shadow-1, 2px 2px 0px #000000);
      transition:
        transform    var(--ds-alias-transition-snappy, 100ms linear),
        box-shadow   var(--ds-alias-transition-snappy, 100ms linear),
        background   var(--ds-alias-transition-smooth, 200ms ease),
        color        var(--ds-alias-transition-smooth, 200ms ease),
        border-color var(--ds-alias-transition-smooth, 200ms ease);
    }

    :host([variant='default']) {
      --ds-btn-bg:           var(--ds-alias-action-bg, #FFFFFF);
      --ds-btn-color:        var(--ds-alias-action-color, #1A1A1A);
      --ds-btn-border-color: var(--ds-alias-action-border, #1A1A1A);
      --ds-btn-border-style: solid;
    }
    :host([variant='primary']) {
      --ds-btn-bg:           var(--ds-alias-action-bg-primary, #FF4F00);
      --ds-btn-color:        var(--ds-alias-action-color-primary, #FFFFFF);
      --ds-btn-border-color: var(--ds-alias-action-bg-primary, #FF4F00);
      --ds-btn-border-style: solid;
    }
    :host([variant='ghost']) {
      --ds-btn-bg:           transparent;
      --ds-btn-shadow:       none;
      --ds-btn-border-style: dashed;
      --ds-btn-color:        var(--ds-alias-action-color, #1A1A1A);
      --ds-btn-border-color: var(--ds-alias-action-border, #1A1A1A);
    }

    :host([size='md']) {
      --ds-btn-padding-x: var(--ds-alias-action-padding-x, 16px);
      --ds-btn-padding-y: var(--ds-alias-action-padding-y, 12px);
      --ds-btn-font-size: var(--ds-alias-font-size-btn, 12px);
    }
    :host([size='sm']) {
      --ds-btn-padding-x: var(--ds-alias-action-padding-x-sm, 12px);
      --ds-btn-padding-y: var(--ds-alias-action-padding-y-sm, 4px);
      --ds-btn-font-size: var(--ds-alias-font-size-btn-sm, 10px);
    }

    :host(:hover),
    :host(:has(*:focus-visible)) {
      transform: translate(-1px, -1px);
      --ds-btn-shadow: var(--ds-alias-shadow-2, 4px 4px 0px #000000);
    }

    :host(:has(*:active)) {
      transform: translate(1px, 1px);
      --ds-btn-shadow: var(--ds-alias-shadow-0, 1px 1px 0px #000000);
    }

    :host([variant='ghost']:has(*:active)) {
      transform: translate(0, 0);
    }

    ::slotted(*) {
      font-family: var(--ds-btn-font, var(--ds-alias-font-technical, 'JetBrains Mono', monospace));
      font-size:   var(--ds-btn-font-size, 12px);
      font-weight: var(--ds-btn-font-weight, var(--ds-alias-font-weight-bold, 600));
      text-transform: uppercase;
      border-radius: 0;
      border: 1px solid var(--ds-btn-border-color, #1A1A1A);
      border-style: var(--ds-btn-border-style, solid);
      background: var(--ds-btn-bg, #FFFFFF);
      color: var(--ds-btn-color, #1A1A1A);
      padding: var(--ds-btn-padding-y, 12px) var(--ds-btn-padding-x, 16px);
      box-shadow: var(--ds-btn-shadow);
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
    }
  `;

  @property({ type: String, reflect: true }) variant: 'default' | 'primary' | 'ghost' = 'default';
  @property({ type: String, reflect: true }) size: 'sm' | 'md' = 'md';

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
    'ds-btn': DsBtn;
  }
}
