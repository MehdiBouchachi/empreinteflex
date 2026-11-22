"use client";
/**
 * reveal-wrappers.jsx
 *
 * Three tiny client islands — each attaches one IntersectionObserver,
 * fires once, then disconnects. All animation is CSS-only.
 *
 * Export them individually so tree-shaking works correctly.
 * Import in page.js:
 *   import HeroReveal from "@/components/HeroReveal";
 *   import CardReveal from "@/components/CardReveal";
 *   import InfoReveal from "@/components/InfoReveal";
 *
 * Or put each in its own file (recommended for large projects).
 */

import { useEffect, useRef } from "react";

function useReveal(className, delay = 0, threshold = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      // Mark all reveal children visible immediately
      el.querySelectorAll(`.${className}`).forEach((c) =>
        c.classList.add("is-visible"),
      );
      el.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          // Also cascade to direct CSS reveal children
          el.querySelectorAll(`.${className}`).forEach((c) =>
            c.classList.add("is-visible"),
          );
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [className, threshold]);
  return ref;
}

/* ── Hero wrapper — triggers .contact-hero-reveal children ── */
export function HeroReveal({ children }) {
  const ref = useReveal("contact-hero-reveal", 0, 0.1);
  return <div ref={ref}>{children}</div>;
}

/* ── Card wrapper — single card entrance ── */
export function CardReveal({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      el.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="contact-card-reveal">
      {children}
    </div>
  );
}

/* ── Info side wrapper — fade-up reveal ── */
export function InfoReveal({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      el.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="contact-reveal"
      style={{ transitionDelay: "150ms" }}
    >
      {children}
    </div>
  );
}

// Default export for convenience (CardReveal is the most common use)
export default CardReveal;
