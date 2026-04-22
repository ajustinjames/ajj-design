import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('ds-label')
export class DsLabel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--ds-label-font, var(--ds-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: var(--ds-label-size, var(--ds-alias-font-size-label, 11px));
      color: var(--ds-label-color, var(--ds-alias-text-main, #1A1A1A));
      letter-spacing: var(--ds-label-letter-spacing, var(--ds-alias-tracking-wide, 0.05em));
      margin-bottom: var(--ds-label-margin-bottom, var(--ds-alias-space-1, 4px));
      text-transform: uppercase;
      transition: color var(--ds-alias-transition-smooth, 200ms ease);
    }

    :host([tone='muted'])  { color: var(--ds-alias-text-muted, #666666); }
    :host([tone='accent']) { color: var(--ds-global-color-accent, #FF4F00); }
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
    'ds-label': DsLabel;
  }
}
