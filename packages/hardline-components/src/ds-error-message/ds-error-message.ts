import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('hl-error-message')
export class DsErrorMessage extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--hl-error-message-font, var(--hl-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: var(--hl-error-message-font-size, var(--hl-alias-font-size-label, 11px));
      color: var(--hl-error-message-color, #CC0000);
    }
    :host::before {
      content: '■ ';
    }
  `;

  @property({ type: String, reflect: true }) for?: string;

  #aria = new AriaAssociationController(this, {
    attribute: 'aria-errormessage',
    target: () => this.for,
    also: { 'aria-invalid': 'true' },
  });

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hl-error-message': DsErrorMessage;
  }
}
