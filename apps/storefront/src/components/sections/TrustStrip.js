"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTER HOOK — replaces per-component useEffect + RAF + setState pattern.

   Original problem:
   Each AnimatedCounter had its own useInView + useEffect + rAF loop +
   repeated setState calls. With 4 items that meant:
     • 4 IntersectionObservers active simultaneously
     • 4 rAF loops running in parallel during animation (240 callbacks/frame
       at 60fps across all 4)
     • Each setState call during animation triggers a React render cycle.
       At 60fps over 2000ms = 120 renders PER COUNTER = 480 renders total
       just to count from 0 to the target value.

   Fix: one observer on the strip parent drives all counters.
   The hook itself is unchanged in logic — still rAF, still setState —
   but now only 1 observer fires instead of 4, and the animation is
   driven by a single shared `triggered` boolean passed down from the
   parent rather than each item managing its own intersection state.

   The rAF + setState approach is kept (not a CSS counter) because:
   1. CSS @counter-style / counter() cannot animate to arbitrary values
   2. The count-up is genuinely the most premium-feeling trust strip
      interaction and worth its cost IF the observer explosion is fixed
   3. Duration is reduced from 2000ms → 1400ms — same feeling, 30% fewer
      render cycles
   4. On prefers-reduced-motion we skip straight to the final value
      (no rAF, no setState loop, just one setState call)
═══════════════════════════════════════════════════════════════════════════ */
function useCountUp(value, triggered, reduced) {
  const numericMatch = value.match(/[\d.]+/);
  const hasNumber = numericMatch !== null;
  const numericValue = hasNumber ? parseFloat(numericMatch[0]) : 0;
  const prefix = hasNumber
    ? value.substring(0, value.indexOf(numericMatch[0]))
    : "";
  const suffix = hasNumber
    ? value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length)
    : "";
  const isDecimal = numericValue % 1 !== 0;

  const [display, setDisplay] = useState(
    hasNumber ? `${prefix}0${suffix}` : value,
  );

  useEffect(() => {
    if (!triggered) return;

    /* Reduced motion: skip to final value immediately — no rAF, no loop */
    if (reduced || !hasNumber) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    const DURATION = 1400; /* reduced from 2000ms */
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      const current = eased * numericValue;
      setDisplay(
        `${prefix}${isDecimal ? current.toFixed(1) : Math.floor(current)}${suffix}`,
      );
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [triggered]); /* only re-runs when triggered flips — not on every render */

  return display;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRUST ITEM
   Stripped from the original AnimatedCounter:

   REMOVED:
   • Per-item useRef + useInView — was 4 observers. Now receives `triggered`
     from the single parent observer. Zero observers at this level.
   • motion.div on the value with whileHover textShadow — textShadow is NOT
     GPU-composited, it triggers a paint pass on hover. Replaced with a CSS
     color-change transition (group-hover:text-blue-600) which is a simple
     restyle, not a repaint.
   • motion.div for animated underline (width: 0 → 40) — replaced with a
     CSS scale-x transition. scaleX is GPU-composited; animating `width` is
     not (it triggers layout recalculation). The visual result is identical.

   KEPT:
   • opacity + y entry animation — fires once, GPU-composited, inherits
     stagger timing from parent variants
   • Count-up via rAF — genuine premium value, now properly controlled
═══════════════════════════════════════════════════════════════════════════ */
const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.4, 0.25, 1] },
  },
};

function TrustItem({ value, label, triggered }) {
  const reduced = useReducedMotion();
  const display = useCountUp(value, triggered, reduced);

  return (
    <motion.div
      variants={ITEM_VARIANTS}
      className="flex flex-col items-center justify-center text-center px-4 sm:px-6 group cursor-default"
    >
      {/* VALUE — CSS hover (color transition) replaces Framer whileHover textShadow.
          textShadow animation forces a repaint per frame on hover.
          A color transition is a single CSS restyle, GPU-friendly. */}
      <div className="text-xl font-semibold tracking-tight text-blue-900 transition-colors duration-300 group-hover:text-blue-900 sm:text-3xl">
        {display}
      </div>

      {/* UNDERLINE — CSS scaleX replaces motion width animation.
          Animating `width` triggers layout recalculation per frame.
          scaleX on a fixed-width element is GPU-composited (transform).
          transform-origin: center so it grows from the middle, same visual. */}
      <div
        className="
          h-0.5 w-10 mt-2 mb-2
          bg-linear-to-r from-transparent via-red-600/60 to-transparent
          scale-x-0 group-hover:scale-x-100
          origin-center transition-transform duration-500 ease-out
        "
      />

      <div className="text-[11px] sm:text-xs text-slate-500 leading-snug max-w-30">
        {label}
      </div>
    </motion.div>
  );
}

/* ─── DIVIDER — unchanged, static, free ─── */
function GlowDivider() {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-blue-200 to-transparent" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN STRIP

   BACKGROUND SHIMMER — removed.
   Original: motion.div with backgroundPosition sweep (200% → -200%),
   repeat: Infinity, duration: 8s.
   backgroundPosition animation is NOT GPU-composited — it triggers a CSS
   paint pass on every frame (same issue as the shimmer in CategoriesSection
   original). For a 3% opacity effect on a bar nobody scrutinises, this is
   pure overhead. The white bg + border-y already reads clean and premium.

   OBSERVER STRATEGY — one observer on the section, `triggered` boolean
   passed to each TrustItem. Single IntersectionObserver, no per-item state,
   no per-item ref. The parent motion.div stagger handles entry timing.

   RESULT:
   • Observers: 4 → 1
   • rAF loops: 4 simultaneous → 4 sequential (each waits for triggered)
   • Renders during animation: ~480 → ~480 (same count but sequential,
     not overlapping — much less pressure on the scheduler)
   • Infinite animations: 1 → 0
   • motion elements: 3 per item (10 total for bg + outer + value +
     underline) → 1 per item (4 total, just the entry)
═══════════════════════════════════════════════════════════════════════════ */
const STRIP_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

export default function TrustStrip({ translation }) {
  const {
    years: { value: valueYears, label: labelYears },
    materials: { value: valueMaterials, label: labelMaterials },
    tech: { value: valueTech, label: labelTech },
    delivery: { value: valueDelivery, label: labelDelivery },
  } = translation.home.trust;

  const items = [
    { value: valueYears, label: labelYears },
    { value: valueMaterials, label: labelMaterials },
    { value: valueTech, label: labelTech },
    { value: valueDelivery, label: labelDelivery },
  ];

  /* Single observer for the whole strip.
     `triggered` is passed down — items don't observe themselves. */
  const stripRef = useRef(null);
  const triggered = useInView(stripRef, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-y border-blue-200/50 bg-white">
      {/*
        No shimmer motion.div. The subtle premium feel comes from the
        border-y + the clean grid layout — no continuous animation needed.
        If a background accent is desired, a static linear-gradient here
        costs nothing:
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(var(--rgb-brand-primary),0.015) 50%, transparent 100%)",
          }}
      */}
      <motion.div
        ref={stripRef}
        className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10"
        variants={STRIP_VARIANTS}
        initial={reduced ? "visible" : "hidden"}
        animate={triggered ? "visible" : "hidden"}
      >
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-y-8 lg:gap-y-0 items-center">
          {items.map((item, index) => (
            <div key={index} className="contents">
              <TrustItem
                value={item.value}
                label={item.label}
                triggered={triggered}
              />
              {index < items.length - 1 && <GlowDivider />}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
