import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('ds-error-message')
export class DsErrorMessage extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--ds-error-message-font, var(--ds-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: var(--ds-error-message-font-size, var(--ds-alias-font-size-label, 11px));
      color: var(--ds-error-message-color, #CC0000);
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
    'ds-error-message': DsErrorMessage;
  }
}
