import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean | undefined;
}

@customElement('gl-input')
export class DsInput extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: stretch;
      overflow: hidden;
      font-family: var(--gl-input-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      border: 1px solid var(--gl-input-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      border-radius: var(--gl-input-radius, var(--gl-alias-input-radius, var(--gl-alias-radius-sm, 10px)));
      background: var(--gl-input-bg, var(--gl-alias-surface-bg-alt, #F0F0EC));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      backdrop-filter: var(--gl-alias-vibrancy-base, blur(20px) saturate(180%));
      box-shadow: var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      transition:
        background-color var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1)),
        border-color     var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1)),
        box-shadow       var(--gl-alias-transition-smooth, 250ms cubic-bezier(0.32, 0.72, 0, 1));
    }

    :host(:focus-within) {
      border-color: var(--gl-global-color-accent, #0A84FF);
      box-shadow:
        var(--gl-input-shadow-focus, var(--gl-alias-shadow-accent, 0 0 0 4px rgba(10, 132, 255, 0.35))),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
      background: var(--gl-alias-surface-bg-strong, rgba(255, 255, 255, 0.72));
    }

    :host([state='error']) {
      border-color: var(--gl-input-border-error, var(--gl-alias-status-error, #FF453A));
    }
    :host([state='error']:focus-within) {
      border-color: var(--gl-input-border-error, var(--gl-alias-status-error, #FF453A));
      box-shadow:
        var(--gl-input-shadow-error, var(--gl-alias-shadow-error, 0 0 0 4px rgba(255, 69, 58, 0.30))),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
    }
    :host([state='success']) {
      border-color: var(--gl-input-border-success, var(--gl-alias-status-success, #30D158));
    }

    :host([density='compact']) {
      --gl-input-padding: 6px;
    }

    :host([disabled]) {
      pointer-events: none;
      opacity: 0.4;
      cursor: not-allowed;
    }

    ::slotted([slot='label']) {
      display: flex;
      align-items: center;
      white-space: nowrap;
      font-family: var(--gl-alias-font-technical, 'SF Mono', ui-monospace, 'JetBrains Mono', monospace);
      font-size: var(--gl-alias-font-size-label, 11px);
      letter-spacing: var(--gl-alias-tracking-wide, 0.02em);
      text-transform: uppercase;
      color: var(--gl-alias-text-muted, rgba(60, 60, 67, 0.6));
      padding: 0 var(--gl-alias-space-3, 12px);
      border-right: 1px solid var(--gl-input-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      background: var(--gl-alias-surface-bg-alt, rgba(255, 255, 255, 0.40));
      align-self: stretch;
    }

    ::slotted(input),
    ::slotted(textarea) {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--gl-input-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      font-size: var(--gl-input-font-size, 15px);
      color: var(--gl-input-text, var(--gl-alias-text-main, #1D1D1F));
      padding: var(--gl-input-padding, var(--gl-alias-input-padding, 10px));
    }

    :host([data-type='clinical']) ::slotted(input) {
      font-family: var(--gl-alias-font-technical, 'SF Mono', ui-monospace, 'JetBrains Mono', monospace);
    }

    ::slotted([slot='unit']) {
      font-family: var(--gl-alias-font-technical, 'SF Mono', ui-monospace, 'JetBrains Mono', monospace);
      font-size: 13px;
      padding: 0 var(--gl-alias-space-3, 12px);
      border-left: 1px solid var(--gl-input-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      color: var(--gl-alias-text-muted, rgba(60, 60, 67, 0.6));
      align-self: stretch;
      display: flex;
      align-items: center;
    }
  `;

  @property({ type: String, reflect: true }) state: 'default' | 'error' | 'success' = 'default';
  @property({ type: String, reflect: true }) density: 'compact' | 'default' = 'default';
  @property({ type: String, reflect: true, attribute: 'label-for' }) labelFor?: string;
  @property({ type: String, reflect: true, attribute: 'data-type' }) dataType?: 'clinical';
  @property({ type: Boolean, reflect: true }) disabled = false;

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
      const isDsLabel = label.tagName.toLowerCase() === 'gl-label';
      if ((isNativeLabel || isDsLabel) && !label.getAttribute('for')) {
        label.setAttribute('for', this.labelFor);
      }
    }

    if (globalThis.__DEV__ !== false && this.disabled) {
      const native = this.querySelector<HTMLElement>('input, textarea, select');
      if (native && !native.hasAttribute('disabled')) {
        console.warn('<gl-input>: `disabled` set on shell but slotted native missing `disabled`. Keep them in sync.');
      }
    }

    if (globalThis.__DEV__ !== false) {
      const associated =
        (label?.getAttribute('for') && input?.id) ||
        input?.getAttribute('aria-labelledby') ||
        input?.getAttribute('aria-label');
      if (label && input && !associated) {
        console.warn(
          '<gl-input>: label/input not associated. Set `label-for="<input-id>"`, or provide `aria-labelledby`/`aria-label` on the input.'
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
    'gl-input': DsInput;
  }
}
