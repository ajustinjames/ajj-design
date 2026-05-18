import { fixture, html, expect } from '@open-wc/testing';
import type { DsAvatar } from '../src/ds-avatar/ds-avatar.js';
import '../src/ds-avatar/ds-avatar.js';

describe('hl-avatar', () => {
  it('defaults size to md', async () => {
    const el = await fixture<DsAvatar>(html`<hl-avatar></hl-avatar>`);
    expect(el.size).to.equal('md');
  });

  it('sets data-mode=empty with no image or initials', async () => {
    const el = await fixture<DsAvatar>(html`<hl-avatar></hl-avatar>`);
    expect(el.getAttribute('data-mode')).to.equal('empty');
  });

  it('sets data-mode=initials when initials prop is set', async () => {
    const el = await fixture<DsAvatar>(html`<hl-avatar initials="AJ"></hl-avatar>`);
    expect(el.getAttribute('data-mode')).to.equal('initials');
    expect(el.shadowRoot!.textContent).to.include('AJ');
  });

  it('sets data-mode=image when image slot is filled', async () => {
    const el = await fixture<DsAvatar>(html`
      <hl-avatar>
        <img slot="image" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="user" />
      </hl-avatar>
    `);
    await el.updateComplete;
    expect(el.getAttribute('data-mode')).to.equal('image');
  });
});
