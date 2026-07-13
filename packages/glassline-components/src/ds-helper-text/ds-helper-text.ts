import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('gl-helper-text')
export class DsHelperText extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--gl-helper-text-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      font-size: var(--gl-helper-text-font-size, var(--gl-alias-font-size-footnote, 13px));
      color: var(--gl-helper-text-color, var(--gl-alias-text-muted, rgba(60, 60, 67, 0.6)));
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
    'gl-helper-text': DsHelperText;
  }
}
