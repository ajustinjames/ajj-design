import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('hl-helper-text')
export class DsHelperText extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--hl-helper-text-font, var(--hl-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: var(--hl-helper-text-font-size, var(--hl-alias-font-size-label, 11px));
      color: var(--hl-helper-text-color, var(--hl-alias-text-muted, #666666));
    }
  `;

  @property({ type: String, reflect: true }) for?: string;

  #aria = new AriaAssociationController(this, {
    attribute: 'aria-describedby',
    target: () => this.for,
  });

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hl-helper-text': DsHelperText;
  }
}
