import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('ds-helper-text')
export class DsHelperText extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--ds-helper-text-font, var(--ds-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: var(--ds-helper-text-font-size, var(--ds-alias-font-size-label, 11px));
      color: var(--ds-helper-text-color, var(--ds-alias-text-muted, #666666));
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
    'ds-helper-text': DsHelperText;
  }
}
