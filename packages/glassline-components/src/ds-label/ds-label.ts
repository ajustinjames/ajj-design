import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('gl-label')
export class DsLabel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--gl-label-font, var(--gl-alias-font-technical, 'SF Mono', ui-monospace, 'JetBrains Mono', monospace));
      font-size: var(--gl-label-size, var(--gl-alias-font-size-label, 11px));
      color: var(--gl-label-color, var(--gl-alias-text-main, #1D1D1F));
      letter-spacing: var(--gl-label-letter-spacing, var(--gl-alias-tracking-wide, 0.02em));
      margin-bottom: var(--gl-label-margin-bottom, var(--gl-alias-space-1, 4px));
      text-transform: uppercase;
      transition: color var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1));
    }

    :host([tone='muted'])  { color: var(--gl-alias-text-muted, rgba(60, 60, 67, 0.6)); }
    :host([tone='accent']) { color: var(--gl-global-color-accent, #0A84FF); }
  `;

  @property({ type: String, reflect: true }) for?: string;
  @property({ type: String, reflect: true }) tone: 'default' | 'muted' | 'accent' = 'default';

  #aria = new AriaAssociationController(this, {
    attribute: 'aria-labelledby',
    target: () => this.for,
  });

  render() {
    return html`<span part="root"><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gl-label': DsLabel;
  }
}
