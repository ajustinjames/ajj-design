import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ds-divider')
export class DsDivider extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: none;
    }
    :host([orientation='horizontal']) {
      width: 100%;
      height: 1px;
      background: var(--ds-divider-color, var(--ds-alias-surface-border, #1A1A1A));
    }
    :host([orientation='vertical']) {
      width: 1px;
      height: 100%;
      background: var(--ds-divider-color, var(--ds-alias-surface-border, #1A1A1A));
      align-self: stretch;
    }
    :host([tone='muted']) {
      --ds-divider-color: var(--ds-alias-text-muted, #666666);
    }
  `;

  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';
  @property({ type: String, reflect: true }) tone: 'default' | 'muted' = 'default';

  constructor() {
    super();
    this.setAttribute('role', 'separator');
  }

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ds-divider': DsDivider; }
}
