import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-card')
export class DsCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: var(--ds-card-bg, var(--ds-alias-surface-bg, #FFFFFF));
      border: var(--ds-card-border-width, 1px) solid var(--ds-card-border-color, var(--ds-alias-surface-border, #1A1A1A));
      padding: var(--ds-card-padding, 24px);
      border-radius: var(--ds-card-radius, 0px);
      box-shadow: var(--ds-card-shadow, var(--ds-alias-shadow-1, 2px 2px 0px #000000));
      transition:
        transform var(--ds-alias-transition-snappy, 100ms linear),
        box-shadow var(--ds-alias-transition-snappy, 100ms linear);
    }

    :host([elevation='1']) { --ds-card-shadow: var(--ds-alias-shadow-1, 2px 2px 0px #000000); }
    :host([elevation='2']) { --ds-card-shadow: var(--ds-alias-shadow-2, 4px 4px 0px #000000); }
    :host([elevation='3']) { --ds-card-shadow: var(--ds-alias-shadow-3, 8px 8px 0px #000000); }

    :host(:hover),
    :host(:has(*:focus-visible)) {
      transform: translate(-1px, -1px);
      --ds-card-shadow: var(--ds-alias-shadow-2, 4px 4px 0px #000000);
    }
  `;

  @property({ type: Number, reflect: true }) elevation: 1 | 2 | 3 = 1;

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
    'ds-card': DsCard;
  }
}
