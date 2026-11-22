// ─────────────────────────────────────────────────────────────────────────────
// FILE 1 — sectionBackground.js
// Shared background token system. Import this into every section.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UNIFIED SECTION BACKGROUND SYSTEM
 *
 * Structure (every section):
 *   Layer 1 — Base: linear white → the shared muted surface token
 *   Layer 2 — Accent: ONE radial ellipse using the shared brand token
 *   Layer 3 — Depth (optional): very subtle edge fade
 *
 * Differentiation:
 *   - categories   → lightest, radial top-right, airy feeling
 *   - products     → neutral, radial top-center, balanced
 *   - testimonials → slightly deeper, radial bottom-left, grounded
 *   - cta          → most focused, radial dead-center, concentrated
 *
 * Colors used: the shared white, muted-surface, and brand tokens only.
 * Zero blur. Zero animation. Pure static CSS.
 */

export const SECTION_BG = {
  /**
   * Categories — lightest / most airy
   * Radial accent top-right at 0.05 opacity
   * Base sweeps from white (top) to surface (bottom)
   */
  categories: `
    radial-gradient(ellipse 72% 52% at 85% 0%, rgba(var(--rgb-brand-primary), 0.05) 0%, transparent 68%),
    linear-gradient(180deg, var(--color-surface-base) 0%, var(--color-surface-muted) 100%)
  `,

  /**
   * Products — neutral / balanced
   * Radial accent top-center at 0.06 opacity
   * Base sweeps from surface (top) to white (mid) to surface (bottom)
   */
  products: `
    radial-gradient(ellipse 80% 44% at 50% 0%, rgba(var(--rgb-brand-primary), 0.06) 0%, transparent 65%),
    linear-gradient(180deg, var(--color-surface-muted) 0%, var(--color-surface-base) 45%, var(--color-surface-muted) 100%)
  `,

  /**
   * Testimonials — slightly deeper / grounded
   * Radial accent bottom-left at 0.08 opacity
   * Base sweeps from surface (top) through white back to surface
   */
  testimonials: `
    radial-gradient(ellipse 75% 55% at 15% 100%, rgba(var(--rgb-brand-primary), 0.08) 0%, transparent 65%),
    linear-gradient(175deg, var(--color-surface-muted) 0%, var(--color-surface-base) 48%, var(--color-surface-muted) 100%)
  `,

  /**
   * CTA — most focused / concentrated
   * Radial accent dead-center at 0.10 opacity — creates subtle vignette pull
   * Base is mostly white with surface edges for contrast
   */
  cta: `
    radial-gradient(ellipse 60% 60% at 50% 50%, rgba(var(--rgb-brand-primary), 0.10) 0%, transparent 70%),
    linear-gradient(180deg, var(--color-surface-muted) 0%, var(--color-surface-base) 30%, var(--color-surface-base) 70%, var(--color-surface-muted) 100%)
  `,
};
