import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean | undefined;
}

@customElement('ds-input')
export class DsInput extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: stretch;
      border: 1px solid var(--ds-input-border, var(--ds-alias-surface-border, #1A1A1A));
      background: var(--ds-input-bg, var(--ds-alias-surface-bg-alt, #F0F0EC));
      box-shadow: var(--ds-input-shadow-idle, var(--ds-alias-shadow-inset, inset 1px 1px 0px rgba(0,0,0,0.1)));
      transition:
        background-color var(--ds-alias-transition-smooth, 200ms ease),
        border-color     var(--ds-alias-transition-smooth, 200ms ease),
        box-shadow       var(--ds-alias-transition-smooth, 200ms ease);
    }

    :host(:focus-within) {
      background: var(--ds-input-bg-focus, var(--ds-alias-surface-bg, #FFFFFF));
      border-color: var(--ds-global-color-accent, #FF4F00);
      box-shadow: var(--ds-input-shadow-focus, var(--ds-alias-shadow-accent, 2px 2px 0px #FF4F00));
    }

    :host([state='error']) {
      border-color: var(--ds-input-border-error, var(--ds-alias-status-error, #CC0000));
    }
    :host([state='error']:focus-within) {
      border-color: var(--ds-input-border-error, var(--ds-alias-status-error, #CC0000));
      box-shadow: var(--ds-input-shadow-error, var(--ds-alias-shadow-error, 2px 2px 0px #CC0000));
    }
    :host([state='success']) {
      border-color: var(--ds-input-border-success, var(--ds-alias-status-success, #1A6B1A));
    }

    :host([density='compact']) {
      --ds-input-padding: 4px;
    }

    ::slotted(input),
    ::slotted(textarea) {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--ds-input-font, var(--ds-alias-font-ui, 'Inter', system-ui, sans-serif));
      font-size: var(--ds-input-font-size, 14px);
      color: var(--ds-input-text, var(--ds-alias-text-main, #1A1A1A));
      padding: var(--ds-input-padding, var(--ds-alias-input-padding, 8px));
    }

    :host([data-type='clinical']) ::slotted(input) {
      font-family: var(--ds-font-mono, 'JetBrains Mono', monospace);
    }

    ::slotted([slot='unit']) {
      font-family: var(--ds-font-mono, 'JetBrains Mono', monospace);
      font-size: 12px;
      padding: 0 var(--ds-alias-space-2, 8px);
      border-left: 1px solid var(--ds-input-border, #1A1A1A);
      color: var(--ds-alias-text-muted, #666666);
      align-self: stretch;
      display: flex;
      align-items: center;
    }
  `;

  @property({ type: String, reflect: true }) state: 'default' | 'error' | 'success' = 'default';
  @property({ type: String, reflect: true }) density: 'compact' | 'default' = 'default';
  @property({ type: String, reflect: true, attribute: 'label-for' }) labelFor?: string;
  @property({ type: String, reflect: true, attribute: 'data-type' }) dataType?: 'clinical';

  connectedCallback(): void {
    super.connectedCallback();
    const input = this.querySelector<HTMLElement>(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
    );
    const label = this.querySelector<HTMLElement>('[slot="label"]');

    if (this.labelFor && input && !input.id) {
      input.id = this.labelFor;
    }
    if (this.labelFor && label) {
      const isNativeLabel = label instanceof HTMLLabelElement;
      const isDsLabel = label.tagName.toLowerCase() === 'ds-label';
      if ((isNativeLabel || isDsLabel) && !label.getAttribute('for')) {
        label.setAttribute('for', this.labelFor);
      }
    }

    if (globalThis.__DEV__ !== false) {
      const associated =
        (label?.getAttribute('for') && input?.id) ||
        input?.getAttribute('aria-labelledby') ||
        input?.getAttribute('aria-label');
      if (label && input && !associated) {
        console.warn(
          '<ds-input>: label/input not associated. Set `label-for="<input-id>"`, or provide `aria-labelledby`/`aria-label` on the input.'
        );
      }
    }
  }

  render() {
    return html`
      <div part="root" style="display:contents">
        <slot name="label"></slot>
        <slot></slot>
        <slot name="unit"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-input': DsInput;
  }
}
