"use client";

/**
 * BenefitsRowClient.js
 * ─────────────────────────────────────────────────────────────────────────
 * Isolated "use client" island — only the accordion needs state.
 * WhyLitmadSection stays a server component; this is the only client part.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EX = [0.16, 1, 0.3, 1];

export default function BenefitsRow({ locale, T, isRTL }) {
  const [active, setActive] = useState(null);
  const benefits = T.benefits;
  const toggle = (i) => setActive((p) => (p === i ? null : i));

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {/* Eyebrow row */}
      <div className={`mb-6 flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
        <p className="flex-shrink-0 text-[10px] font-medium uppercase tracking-[0.45em] text-blue-900/50">
          {T.benefitsEyebrow}
        </p>
        <span className="h-px flex-1 bg-blue-900/10" />
      </div>

      {/* ── DESKTOP 4-col grid ── */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-4 border-t border-blue-900/10">
          {benefits.map((b, i) => {
            const on = active === i;
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                aria-expanded={on}
                className={`group relative text-left focus-visible:outline-none
                  border-blue-900/10 py-5 transition-colors duration-200
                  ${isRTL
                    ? `${i > 0 ? "pr-5 lg:pr-6" : ""} ${i < benefits.length - 1 ? "border-l pl-5 lg:pl-6" : ""}`
                    : `${i > 0 ? "pl-5 lg:pl-6" : ""} ${i < benefits.length - 1 ? "border-r pr-5 lg:pr-6" : ""}`
                  }`}
              >
                <span className={`block text-[10px] font-medium uppercase tracking-[0.42em] mb-2.5
                  transition-colors duration-200
                  ${on ? "text-red-600" : "text-blue-900/40 group-hover:text-blue-900/70"}`}>
                  0{i + 1}
                </span>
                <span className={`block font-semibold leading-snug text-sm lg:text-[0.9rem]
                  transition-colors duration-200
                  ${isRTL ? "text-right" : "text-left"}
                  ${on ? "text-slate-900" : "text-slate-900/55 group-hover:text-slate-900/85"}`}>
                  {b.headline}
                </span>
                {/* Active bottom bar */}
                <span className={`absolute bottom-0 h-[2px] bg-red-600 transition-all duration-300 ease-out
                  ${isRTL ? "right-0" : "left-0"} ${on ? "w-full" : "w-0"}`} />
                {/* Toggle + */}
                <span className={`absolute top-5 ${isRTL ? "left-1.5" : "right-1.5"}
                  text-sm font-light text-blue-900/50 transition-transform duration-300
                  ${on ? "rotate-45 text-red-600" : "rotate-0"}`} aria-hidden="true">
                  +
                </span>
              </button>
            );
          })}
        </div>

        {/* Proof panel */}
        <AnimatePresence>
          {active !== null && (
            <motion.div
              key={active}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.38, ease: EX }}
              className="overflow-hidden border-t border-blue-900/[0.07]"
            >
              <div className="grid grid-cols-4">
                <div
                  className={`col-span-2 py-5 ${active > 0 ? (isRTL ? "pr-5 lg:pr-6" : "pl-5 lg:pl-6") : ""}`}
                  style={{ gridColumnStart: Math.min(active + 1, 3), gridColumnEnd: Math.min(active + 3, 5) }}
                >
                  <p className={`text-sm text-slate-500 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
                    {benefits[active].proof}
                  </p>
                </div>
              </div>
              {/* Dots */}
              <div className={`flex items-center gap-1.5 pb-4 ${isRTL ? "justify-start" : "justify-end"}`}>
                {benefits.map((_, i) => (
                  <button key={i} onClick={() => toggle(i)}
                    className={`rounded-full transition-all duration-250 focus-visible:outline-none
                      ${active === i ? "h-1.5 w-4 bg-red-600" : "h-1.5 w-1.5 bg-blue-900/15 hover:bg-blue-900/35"}`}
                    aria-label={`Benefit ${i + 1}`} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-px bg-blue-900/10" />
      </div>

      {/* ── MOBILE vertical list ── */}
      <div className="border-t border-blue-900/10 sm:hidden">
        {benefits.map((b, i) => {
          const on = active === i;
          return (
            <div key={i} className="border-b border-blue-900/[0.07]">
              <button
                onClick={() => toggle(i)}
                aria-expanded={on}
                className={`w-full flex items-center justify-between py-4 focus-visible:outline-none
                  ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="w-5 flex-shrink-0 tabular-nums text-[10px] font-medium uppercase tracking-[0.42em] text-blue-900/45">
                    0{i + 1}
                  </span>
                  <span className={`font-semibold text-sm transition-colors duration-150
                    ${isRTL ? "text-right" : "text-left"}
                    ${on ? "text-slate-900" : "text-slate-900/60"}`}>
                    {b.headline}
                  </span>
                </div>
                <span className={`text-sm font-light text-blue-900/50 flex-shrink-0
                  ${isRTL ? "mr-3" : "ml-3"} transition-transform duration-300
                  ${on ? "rotate-45 text-red-600" : "rotate-0"}`} aria-hidden="true">
                  +
                </span>
              </button>
              <AnimatePresence>
                {on && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.32, ease: EX }}
                    className="overflow-hidden"
                  >
                    <p className={`pb-4 text-sm text-slate-500 leading-relaxed ${isRTL ? "pr-8 text-right" : "pl-8 text-left"}`}>
                      {b.proof}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
