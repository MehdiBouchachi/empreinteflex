// ─────────────────────────────────────────────────────────────────────────────
// motionSystem.js — Shared motion constants for the homepage narrative
//
// Philosophy: one easing family, one reveal language, section-specific
// intensity. The homepage reads as a single editorial sequence, not
// a collection of independent animations.
//
// Intensity scale (lowest → highest):
//   TrustStrip  →  CategoriesSection  →  TestimonialsSection  →  FinalCTA
//                                ProductsSection (peak)
// ─────────────────────────────────────────────────────────────────────────────

/** Shared easing — used across every section for visual coherence */
export const EASE = [0.25, 0.4, 0.25, 1];

/** Slightly softer ease for emotional/trust sections */
export const EASE_SOFT = [0.22, 0.6, 0.28, 1];

/**
 * Section-level reveal variants.
 * Each section passes its own stagger + delay so intensity varies
 * while the motion language stays identical.
 *
 * @param {number} stagger - delay between children (seconds)
 * @param {number} delay   - initial delay before first child (seconds)
 */
export function sectionVariants(stagger = 0.1, delay = 0.05) {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
}

/**
 * Item reveal variants — opacity + translateY only.
 * `distance` and `duration` tune per-section intensity.
 *
 * @param {number} distance  - y travel distance in px
 * @param {number} duration  - animation duration in seconds
 * @param {object} ease      - cubic-bezier array
 */
export function itemVariants(distance = 24, duration = 0.7, ease = EASE) {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease },
    },
  };
}

// ─── Pre-composed intensity presets ───────────────────────────────────────────

/** TrustStrip — shortest, cleanest, most reassuring */
export const TRUST_ITEM = itemVariants(16, 0.55, EASE);
export const TRUST_SECTION = sectionVariants(0.1, 0.04);

/** ProductsSection — medium / strongest reveal */
export const PRODUCT_CARD = itemVariants(36, 0.65, EASE);
export const PRODUCT_HEADER = itemVariants(22, 0.7, EASE);
export const PRODUCT_SECTION = sectionVariants(0.11, 0.05);

/** CategoriesSection — softer, lighter continuation */
export const CATEGORY_CARD = itemVariants(26, 0.62, EASE);
export const CATEGORY_HEADER = itemVariants(14, 0.52, EASE);
export const CATEGORY_SECTION = sectionVariants(0.12, 0.04);

/** TestimonialsSection — slower, warmer, more emotional */
export const TESTIMONIAL_HEADER = itemVariants(18, 0.72, EASE_SOFT);
export const TESTIMONIAL_CARD = itemVariants(28, 0.78, EASE_SOFT);
export const TESTIMONIAL_FEATURED = itemVariants(22, 0.85, EASE_SOFT);
export const TESTIMONIAL_SECTION = sectionVariants(0.13, 0.06);

/** FinalCTA — calm, focused, conclusive */
export const CTA_ITEM = itemVariants(20, 0.75, EASE_SOFT);
export const CTA_SECTION = sectionVariants(0.14, 0.08);

// ─── Hover system ─────────────────────────────────────────────────────────────
// Unified CSS-only hover for cards — translateY only, no scale, no shadow drama.
// Use the whileHover prop below for Framer-driven lifts where needed.

/** Framer whileHover for primary cards (Products) */
export const HOVER_LIFT_MD = {
  y: -6,
  transition: { duration: 0.38, ease: EASE },
};

/** Framer whileHover for secondary cards (Categories) */
export const HOVER_LIFT_SM = {
  y: -4,
  transition: { duration: 0.38, ease: EASE },
};

/** No hover motion — for testimonial cards (CSS handles it) */
export const HOVER_NONE = {};
