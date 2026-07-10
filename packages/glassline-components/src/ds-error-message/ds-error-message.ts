import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('gl-error-message')
export class DsErrorMessage extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--gl-error-message-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      font-size: var(--gl-error-message-font-size, var(--gl-alias-font-size-footnote, 13px));
      color: var(--gl-error-message-color, #D70015);
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
    'gl-error-message': DsErrorMessage;
  }
}
