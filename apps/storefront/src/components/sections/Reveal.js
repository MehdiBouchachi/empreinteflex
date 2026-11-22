"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal — a minimal client-side reveal wrapper.
 *
 * Adds the class `is-visible` to the root element when it enters the viewport.
 * All actual animation is handled by CSS (see about-animations.css).
 *
 * Props:
 *   delay  — stagger delay in ms (default: 0)
 *   className — forwarded to the wrapper div
 *   as — element tag (default: "div")
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
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
          // Apply delay via inline style then add class
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-visible");
          observer.unobserve(el); // fire once only
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal-block ${className}`}>
      {children}
    </Tag>
  );
}