import type { ReactiveController, ReactiveControllerHost } from 'lit';

declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean | undefined;
}

export type AriaAssoc =
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'aria-controls'
  | 'aria-errormessage';

export interface AriaAssociationOptions {
  attribute: AriaAssoc;
  target: () => string | undefined;
  also?: Partial<Record<string, string>>;
}

function resolveTarget(host: HTMLElement, id: string): HTMLElement | null {
  let scope: Node = host.getRootNode();
  while (scope) {
    const found = (scope as Document | ShadowRoot).getElementById?.(id);
    if (found) return found;
    if (scope instanceof ShadowRoot) {
      scope = scope.host.getRootNode();
    } else {
      break;
    }
  }
  return document.getElementById(id);
}

export class AriaAssociationController implements ReactiveController {
  #host: ReactiveControllerHost & HTMLElement;
  #opts: AriaAssociationOptions;
  #minted = false;

  constructor(host: ReactiveControllerHost & HTMLElement, opts: AriaAssociationOptions) {
    this.#host = host;
    this.#opts = opts;
    host.addController(this);
  }

  hostConnected(): void {
    if (!this.#host.id) {
      const tag = this.#host.tagName.toLowerCase();
      this.#host.id = `${tag}-${crypto.randomUUID().slice(0, 8)}`;
      this.#minted = true;
      if (
        globalThis.__DEV__ !== false &&
        (this.#opts.attribute === 'aria-labelledby' ||
          this.#opts.attribute === 'aria-errormessage')
      ) {
        console.warn(
          `<${this.#host.tagName.toLowerCase()}>: No id set on host — minted "${this.#host.id}". ` +
          `Set id explicitly for SSR-safe ${this.#opts.attribute} association.`
        );
      }
    }
    this.#write();
  }

  hostUpdated(): void {
    this.#write();
  }

  hostDisconnected(): void {
    const targetId = this.#opts.target();
    if (!targetId) return;
    const target = resolveTarget(this.#host, targetId);
    if (!target) return;
    const attr = this.#opts.attribute;
    const tokens = (target.getAttribute(attr) ?? '')
      .split(' ')
      .filter(t => t && t !== this.#host.id);
    if (tokens.length) {
      target.setAttribute(attr, tokens.join(' '));
    } else {
      target.removeAttribute(attr);
    }
  }

  #write(): void {
    const targetId = this.#opts.target();
    if (!targetId) return;
    const target = resolveTarget(this.#host, targetId);
    if (!target) return;
    const attr = this.#opts.attribute;
    const existing = (target.getAttribute(attr) ?? '').split(' ').filter(Boolean);
    if (!existing.includes(this.#host.id)) {
      existing.push(this.#host.id);
      target.setAttribute(attr, existing.join(' '));
    }
    if (this.#opts.also) {
      for (const [k, v] of Object.entries(this.#opts.also)) {
        target.setAttribute(k, v);
      }
    }
  }
}
