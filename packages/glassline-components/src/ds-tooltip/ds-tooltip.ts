import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AriaAssociationController } from '../foundations/aria-association-controller.js';

@customElement('gl-tooltip')
export class DsTooltip extends LitElement {
  static styles = css`
    :host { display: contents; }
    [role="tooltip"] {
      display: none;
      position: fixed;
      background: var(--gl-tooltip-bg, var(--gl-alias-surface-bg-strong, rgba(255, 255, 255, 0.72)));
      color: var(--gl-tooltip-color, var(--gl-alias-text-main, #1D1D1F));
      font-family: var(--gl-tooltip-font, var(--gl-alias-font-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif));
      font-size: var(--gl-tooltip-font-size, 12px);
      letter-spacing: -0.01em;
      padding: 6px 10px;
      border: 1px solid var(--gl-tooltip-border, var(--gl-alias-surface-border, rgba(255, 255, 255, 0.35)));
      border-radius: var(--gl-tooltip-radius, var(--gl-alias-radius-sm, 10px));
      -webkit-backdrop-filter: var(--gl-alias-vibrancy-strong, blur(40px) saturate(200%));
      backdrop-filter: var(--gl-alias-vibrancy-strong, blur(40px) saturate(200%));
      box-shadow:
        var(--gl-alias-shadow-3, 0 24px 64px rgba(0, 0, 0, 0.24)),
        var(--gl-alias-shadow-inset, inset 0 1px 0 rgba(255, 255, 255, 0.6));
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
    void this.updateComplete.then(() => this.#reposition());
  }

  #hide(): void {
    this._visible = false;
  }

  #reposition(): void {
    if (!this.#anchor) return;
    const anchorRect = this.#anchor.getBoundingClientRect();
    const surfaceRect = this.shadowRoot?.querySelector<HTMLElement>('[role="tooltip"]')?.getBoundingClientRect();
    const OFFSET = 8;
    switch (this.placement) {
      case 'bottom':
        this._x = anchorRect.left;
        this._y = anchorRect.bottom + OFFSET;
        break;
      case 'left':
        this._x = anchorRect.left - (surfaceRect?.width ?? 0) - OFFSET;
        this._y = anchorRect.top;
        break;
      case 'right':
        this._x = anchorRect.right + OFFSET;
        this._y = anchorRect.top;
        break;
      default:
        this._x = anchorRect.left;
        this._y = anchorRect.top - (surfaceRect?.height ?? 0) - OFFSET;
        break;
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
  interface HTMLElementTagNameMap { 'gl-tooltip': DsTooltip; }
}
