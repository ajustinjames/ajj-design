import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hl-card')
export class DsCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--hl-card-font, var(--hl-alias-font-ui, 'Inter', system-ui, sans-serif));
      background: var(--hl-card-bg, var(--hl-alias-surface-bg, #FFFFFF));
      border: var(--hl-card-border-width, 1px) solid var(--hl-card-border-color, var(--hl-alias-surface-border, #1A1A1A));
      padding: var(--hl-card-padding, 24px);
      border-radius: var(--hl-card-radius, 0px);
      box-shadow: var(--hl-card-shadow, var(--hl-alias-shadow-1, 2px 2px 0px #000000));
      transition:
        transform var(--hl-alias-transition-snappy, 100ms linear),
        box-shadow var(--hl-alias-transition-snappy, 100ms linear);
    }

    :host([elevation='1']) { --hl-card-shadow: var(--hl-alias-shadow-1, 2px 2px 0px #000000); }
    :host([elevation='2']) { --hl-card-shadow: var(--hl-alias-shadow-2, 4px 4px 0px #000000); }
    :host([elevation='3']) { --hl-card-shadow: var(--hl-alias-shadow-3, 8px 8px 0px #000000); }

    :host([interactive]:hover),
    :host([interactive]:has(*:focus-visible)) {
      transform: translate(-1px, -1px);
      --hl-card-shadow: var(--hl-alias-shadow-2, 4px 4px 0px #000000);
    }
  `;

  @property({ type: Number, reflect: true }) elevation: 1 | 2 | 3 = 1;
  @property({ type: Boolean, reflect: true }) interactive = false;

  render() {
    return html`
      <div part="root">
        <slot name="header"></slot>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hl-card': DsCard;
  }
}
