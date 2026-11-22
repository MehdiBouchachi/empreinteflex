// ─────────────────────────────────────────────────────────────────────────────
// FILE 4 — FinalCTA.jsx
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import { headingClasses } from "../ui/Heading";

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export default function FinalCTA({ translation, locale }) {
  const { title, desc, button } = translation.home.cta;
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white px-4 py-6 sm:px-6 sm:py-14 lg:px-8 lg:py-20"
    >
      <motion.div
        className="relative mx-auto grid max-w-7xl overflow-hidden rounded-md bg-[var(--color-brand-deep)] px-5 py-8 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-16 lg:py-20"
        variants={CONTAINER_VARIANTS}
        initial={reduced ? "visible" : "hidden"}
        animate={isInView ? "visible" : "hidden"}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-[24rem] w-[24rem] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-2/5 bg-[var(--color-danger)]"
        />
        <div className="relative z-10 max-w-2xl text-start">
          <motion.div
            variants={ITEM_VARIANTS}
            className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white sm:mb-6 sm:text-xs sm:tracking-[0.28em]"
          >
            <span className="h-0.5 w-8 bg-[var(--color-danger)]" aria-hidden="true" />
            Empreinte Flex
          </motion.div>
          <motion.h3
            variants={ITEM_VARIANTS}
            className={headingClasses({
              size: "h2",
              color: "white",
              className: "mb-4 max-w-xl sm:mb-6 lg:max-w-2xl",
            })}
          >
            {title}
          </motion.h3>

          <motion.p
            variants={ITEM_VARIANTS}
            className="mb-6 max-w-xl text-sm leading-relaxed text-blue-100/75 sm:mb-10 sm:text-base lg:text-lg"
          >
            {desc}
          </motion.p>

          <motion.div variants={ITEM_VARIANTS} className="inline-flex">
            <Link href={`/${locale}/mattresses`}>
              <Button variant="accent" size="md" className="sm:px-7 sm:py-3 sm:text-base">
                {button}
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          aria-hidden="true"
          variants={ITEM_VARIANTS}
          className="relative z-10 mt-12 hidden h-64 lg:mt-0 lg:block"
        >
          <div className="absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-md border-2 border-[var(--color-danger)] bg-white/[0.06] shadow-[0_24px_0_-8px_rgba(var(--rgb-brand-primary),0.65)]" />
          <div className="absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-[calc(50%+18px)] rotate-[-8deg] rounded-md border border-white/45 bg-white/[0.04]" />
          <div className="absolute left-1/2 top-1/2 h-0.5 w-80 -translate-x-1/2 translate-y-28 bg-[var(--color-danger)]" />
          <div className="absolute left-1/2 top-1/2 h-px w-52 -translate-x-1/2 -translate-y-10 rotate-[-8deg] bg-white/35" />
          <div className="absolute left-1/2 top-1/2 h-px w-44 -translate-x-1/2 -translate-y-2 rotate-[-8deg] bg-white/25" />
        </motion.div>
      </motion.div>
    </section>
  );
}
