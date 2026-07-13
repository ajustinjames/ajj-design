import { html } from 'lit';

/**
 * Storybook decorator that renders glassline stories over a colorful gradient
 * so the translucency, backdrop blur, and saturation of the glass surfaces are
 * actually visible (they are invisible over a flat background). Scoped to the
 * glassline stories only — it does not touch hardline stories.
 */
export const glassBackdrop = (story: () => unknown) => html`
  <div
    style="
      min-height: 220px;
      margin: -1rem;
      padding: 48px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-start;
      background:
        radial-gradient(circle at 12% 18%, #FF6B6B 0%, transparent 42%),
        radial-gradient(circle at 82% 22%, #4ECDC4 0%, transparent 46%),
        radial-gradient(circle at 68% 84%, #A66CFF 0%, transparent 50%),
        linear-gradient(135deg, #667EEA 0%, #FF8AD8 100%);
      background-attachment: fixed;
    "
  >
    ${story()}
  </div>
`;
