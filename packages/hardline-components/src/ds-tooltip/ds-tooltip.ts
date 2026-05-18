import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('hl-tooltip')
export class DsTooltip extends LitElement {
  static styles = css`
    :host { display: contents; }
    [role="tooltip"] {
      display: none;
      position: fixed;
      background: var(--hl-tooltip-bg, #1A1A1A);
      color: var(--hl-tooltip-color, #F0F0EC);
      font-family: var(--hl-tooltip-font, var(--hl-alias-font-technical, 'JetBrains Mono', monospace));
      font-size: var(--hl-tooltip-font-size, 11px);
      padding: 4px 8px;
      box-shadow: var(--hl-alias-shadow-accent, 2px 2px 0px #FF4F00);
      border-radius: 0;
      z-index: 1000;
      pointer-events: none;
    }
    [role="tooltip"].visible { display: block; }
  `;

  @property({ type: String, reflect: true }) for?: string;
  @property({ type: String, reflect: true }) placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @state() private _visible = false;
  @state() private _x = 0;
  @state() private _y = 0;

  #aria = new AriaAssociationController(this, {
    attribute: 'aria-describedby',
    target: () => this.for,
  });

  #anchor: HTMLElement | null = null;
  #onEnter = () => this.#show();
  #onLeave = () => this.#hide();
  #onFocusIn = () => this.#show();
  #onFocusOut = () => this.#hide();
  #onScroll = () => this._visible && this.#reposition();
  #onResize = () => this._visible && this.#reposition();
  #onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') this.#hide(); };

  connectedCallback(): void {
    super.connectedCallback();
    this.#attachAnchor();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#detachAnchor();
  }

  updated(changed: Map<string, unknown>): void {
    if (changed.has('for')) {
      this.#detachAnchor();
      this.#attachAnchor();
    }
  }

  #attachAnchor(): void {
    if (!this.for) return;
    const root = this.getRootNode() as Document | ShadowRoot;
    this.#anchor = root.getElementById?.(this.for) ?? document.getElementById(this.for);
    if (!this.#anchor) return;
    this.#anchor.addEventListener('mouseenter', this.#onEnter);
    this.#anchor.addEventListener('mouseleave', this.#onLeave);
    this.#anchor.addEventListener('focusin', this.#onFocusIn);
    this.#anchor.addEventListener('focusout', this.#onFocusOut);
    document.addEventListener('keydown', this.#onKeydown);
    window.addEventListener('scroll', this.#onScroll, { capture: true, passive: true });
    window.addEventListener('resize', this.#onResize, { passive: true });
  }

  #detachAnchor(): void {
    if (!this.#anchor) return;
    this.#anchor.removeEventListener('mouseenter', this.#onEnter);
    this.#anchor.removeEventListener('mouseleave', this.#onLeave);
    this.#anchor.removeEventListener('focusin', this.#onFocusIn);
    this.#anchor.removeEventListener('focusout', this.#onFocusOut);
    document.removeEventListener('keydown', this.#onKeydown);
    window.removeEventListener('scroll', this.#onScroll, { capture: true });
    window.removeEventListener('resize', this.#onResize);
    this.#anchor = null;
  }

  #show(): void {
    this._visible = true;
    this.#reposition();
  }

  #hide(): void {
    this._visible = false;
  }

  #reposition(): void {
    if (!this.#anchor) return;
    const r = this.#anchor.getBoundingClientRect();
    const OFFSET = 8;
    switch (this.placement) {
      case 'bottom': this._x = r.left; this._y = r.bottom + OFFSET; break;
      case 'left':   this._x = r.left - OFFSET; this._y = r.top; break;
      case 'right':  this._x = r.right + OFFSET; this._y = r.top; break;
      default:       this._x = r.left; this._y = r.top - OFFSET; break;
    }
  }

  render() {
    return html`
      <div
        role="tooltip"
        class=${this._visible ? 'visible' : ''}
        style="left:${this._x}px;top:${this._y}px"
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'hl-tooltip': DsTooltip; }
}
