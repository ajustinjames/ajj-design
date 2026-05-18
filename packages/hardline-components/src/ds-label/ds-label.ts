import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('hl-label')
export class DsLabel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--hl-label-font, var(--hl-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: var(--hl-label-size, var(--hl-alias-font-size-label, 11px));
      color: var(--hl-label-color, var(--hl-alias-text-main, #1A1A1A));
      letter-spacing: var(--hl-label-letter-spacing, var(--hl-alias-tracking-wide, 0.05em));
      margin-bottom: var(--hl-label-margin-bottom, var(--hl-alias-space-1, 4px));
      text-transform: uppercase;
      transition: color var(--hl-alias-transition-smooth, 200ms ease);
    }

    :host([tone='muted'])  { color: var(--hl-alias-text-muted, #666666); }
    :host([tone='accent']) { color: var(--hl-global-color-accent, #FF4F00); }
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
    'hl-label': DsLabel;
  }
}
