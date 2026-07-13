import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('gl-divider')
export class DsDivider extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: none;
    }
    :host([orientation='horizontal']) {
      width: 100%;
      height: 1px;
      background: var(--gl-divider-color, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
    }
    :host([orientation='vertical']) {
      width: 1px;
      height: 100%;
      background: var(--gl-divider-color, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      align-self: stretch;
    }
    :host([tone='muted']) {
      --gl-divider-color: var(--gl-alias-text-muted, rgba(60, 60, 67, 0.6));
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
  interface HTMLElementTagNameMap { 'gl-divider': DsDivider; }
}
