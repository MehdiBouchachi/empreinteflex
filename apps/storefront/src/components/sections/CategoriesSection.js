"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Heading from "../ui/Heading";
import { SECTION_BG } from "@/lib/sectionBackground";

const HOMEPAGE_CATEGORIES = [
  {
    id: "mattresses",
    available: true,
    translations: { en: "Mattresses", fr: "Matelas", ar: "مراتب" },
    subtitles: {
      en: "Crafted for restorative comfort",
      fr: "Pensés pour un confort réparateur",
      ar: "مصممة لراحة عميقة ومتوازنة",
    },
    href: (locale) => `/${locale}/mattresses`,
    image: "/images/mattress.png",
  },
  {
    id: "toppers",
    available: false,
    translations: {
      en: "Mattress Toppers",
      fr: "Sur-Matelas",
      ar: "أغطية المراتب",
    },
    subtitles: {
      en: "Coming soon for layered comfort",
      fr: "Bientôt pour un confort en supplément",
      ar: "قريباً لطبقة راحة إضافية",
    },
    href: (locale) => `/${locale}/mattresses?category=sur-matelas`,
    image: "/images/topper.png",
  },
  {
    id: "pillows",
    available: false,
    translations: { en: "Pillows", fr: "Oreillers", ar: "وسائد" },
    subtitles: {
      en: "Coming soon for softer support",
      fr: "Bientôt pour un soutien plus doux",
      ar: "قريباً لدعم أكثر نعومة",
    },
    href: (locale) => `/${locale}/mattresses?category=oreiller`,
    image: "/images/pillows.png",
  },
];

const EX = [0.25, 0.4, 0.25, 1];

const vStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};

const vCard = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EX } },
};

const vHeader = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EX } },
};

function getHorizontalOffset(track, node, isRTL) {
  if (!track || !node) return 0;
  const rawLeft = node.offsetLeft - track.offsetLeft;
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (!isRTL) return Math.max(0, Math.min(rawLeft, maxScroll));
  return Math.max(0, Math.min(maxScroll - rawLeft, maxScroll));
}

function CategoryCard({
  cat,
  locale,
  discover,
  index,
  panoramic = false,
  cardRef,
}) {
  const title = cat.translations[locale] || cat.translations.en;
  const subtitle = cat.subtitles[locale] || cat.subtitles.en;
  const isRTL = locale === "ar";
  const isSoon = !cat.available;

  const soonText =
    locale === "ar" ? "قريباً" : locale === "fr" ? "Bientôt" : "Coming Soon";
  const availableText =
    locale === "ar" ? "متاح" : locale === "fr" ? "Disponible" : "Available";

  const inner = (
    <div
      ref={cardRef}
      className={[
        // base
        "bg-white border border-[rgba(26,60,158,0.12)] shadow-[0_18px_42px_rgba(26,60,158,0.08)]",
        // transitions — card level
        "transition-[transform,box-shadow,border-color] duration-[420ms] ease-[cubic-bezier(0.25,0.4,0.25,1)]",
        "will-change-transform",
        // hover
        isSoon
          ? "hover:-translate-y-[3px] cursor-default"
          : "hover:-translate-y-[5px] hover:border-[rgba(26,60,158,0.2)] hover:shadow-[0_24px_56px_rgba(26,60,158,0.12)] cursor-pointer",
        // layout
        "group relative h-full w-full overflow-hidden rounded-md lg:rounded-md",
      ].join(" ")}
    >
      {/* Image */}
      <Image
        src={cat.image}
        alt={title}
        fill
        className={[
          "object-cover object-center",
          // scale on parent hover — Tailwind v3.3+ group-hover
          "transition-transform duration-[900ms] ease-[cubic-bezier(0.25,0.4,0.25,1)] will-change-transform",
          "group-hover:scale-[1.025]",
        ].join(" ")}
        sizes={
          panoramic
            ? "(max-width: 639px) 88vw"
            : "(max-width: 1024px) 50vw, 33vw"
        }
        quality={100}
        priority={index === 0}
      />

      {/* Badge — dir="ltr" keeps dot-then-text order consistent in all locales */}
      <div className={`absolute top-4 z-20 right-4`}>
        <span
          dir="ltr"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-white backdrop-blur-md"
        >
          {!isSoon && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          )}
          {isSoon ? soonText : availableText}
        </span>
      </div>

      {/* Gradient overlay + content */}
      <div
        className={[
          // gradient matches original: transparent → 0.12 → 0.58
          "absolute inset-x-0 bottom-0 z-10 flex flex-col",
          "[background:linear-gradient(180deg,rgba(3,13,45,0)_0%,rgba(3,13,45,0.12)_35%,rgba(3,13,45,0.58)_100%)]",
          isRTL ? "items-end text-right" : "items-start text-left",
          panoramic ? "p-4" : "p-5 sm:p-6 lg:p-7",
        ].join(" ")}
      >
        {/* Red accent bar */}
        <span className="mb-3 h-0.5 w-7 rounded-full bg-[#e30613]" />

        <h3
          className={[
            "max-w-[14ch] font-bold leading-tight text-white drop-shadow-sm",
            panoramic ? "text-xl" : "text-xl lg:text-2xl",
          ].join(" ")}
        >
          {title}
        </h3>

        <p
          className={[
            "mt-1.5 max-w-[28ch] leading-relaxed text-white/75",
            panoramic ? "text-xs" : "text-sm",
          ].join(" ")}
        >
          {subtitle}
        </p>

        {!isSoon && (
          <div
            className={[
              // hidden by default, revealed on card hover
              "mt-3 flex items-center gap-2",
              "translate-y-1.5 opacity-0",
              "transition-[transform,opacity] duration-[320ms] ease-[cubic-bezier(0.25,0.4,0.25,1)]",
              // on mobile (hover: none) always show
              "@media(hover:none){translate-y-0 opacity-100}",
              "group-hover:translate-y-0 group-hover:opacity-100",
            ].join(" ")}
          >
            <span className="block h-px w-5 bg-[#e30613]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">
              {isRTL ? `← ${discover}` : `${discover} →`}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isSoon) return inner;

  return (
    <Link href={cat.href(locale)} aria-label={title} className="block h-full">
      {inner}
    </Link>
  );
}

export default function CategoriesSection({ locale = "en", translation }) {
  const { title, desc, discover } = translation.home.categories;
  const isRTL = locale === "ar";

  const ref = useRef(null);
  const mobileTrackRef = useRef(null);
  const mobileCardRefs = useRef([]);
  const resumeTimeoutRef = useRef(null);
  const userInteractingRef = useRef(false);

  const headerInView = useInView(ref, { once: true, margin: "-50px" });
  const sectionInView = useInView(ref, { amount: 0.35 });
  const prefersReducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const clearResumeTimeout = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const pauseAutoplay = () => {
    clearResumeTimeout();
    userInteractingRef.current = true;
    setIsPaused(true);
  };

  const resumeAutoplayLater = (delay = 3200) => {
    clearResumeTimeout();
    resumeTimeoutRef.current = setTimeout(() => {
      userInteractingRef.current = false;
      setIsPaused(false);
    }, delay);
  };

  const scrollToIndex = (index, behavior = "smooth") => {
    const track = mobileTrackRef.current;
    const node = mobileCardRefs.current[index];
    if (!track || !node) return;
    const left = getHorizontalOffset(track, node, isRTL);
    track.scrollTo({ left, behavior });
  };

  useEffect(() => {
    return () => clearResumeTimeout();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion) return;
    if (!sectionInView) return;

    const media = window.matchMedia("(min-width: 640px)");
    if (media.matches || isPaused) return;
    if (document.visibilityState !== "visible") return;

    const interval = setInterval(() => {
      if (userInteractingRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % HOMEPAGE_CATEGORIES.length;
        scrollToIndex(next, "smooth");
        return next;
      });
    }, 3600);

    return () => clearInterval(interval);
  }, [isPaused, prefersReducedMotion, sectionInView, isRTL]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        clearResumeTimeout();
        setIsPaused(true);
      } else {
        resumeAutoplayLater(1200);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!track) return;

    const onScroll = () => {
      const viewportLeft = track.scrollLeft;
      const offsets = mobileCardRefs.current.map((node) =>
        node ? getHorizontalOffset(track, node, isRTL) : 0,
      );

      let closestIndex = 0;
      let closestDistance = Infinity;
      offsets.forEach((offset, idx) => {
        const distance = Math.abs(offset - viewportLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });
      setActiveIndex(closestIndex);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [isRTL]);

  return (
    <section
      ref={ref}
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden py-12 sm:py-16 lg:py-20"
      style={{ background: "white" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Header */}
        <motion.div
          variants={vHeader}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={headerInView ? "visible" : "hidden"}
          className={`mb-8 sm:mb-10 lg:mb-12 ${isRTL ? "text-right" : ""}`}
        >
          <Heading as="h2" className="mb-2">
            {title}
          </Heading>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500 sm:text-base">
            {desc}
          </p>
        </motion.div>

        {/* ── Mobile carousel (hidden ≥ sm) ── */}
        <motion.div
          variants={vStagger}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={headerInView ? "visible" : "hidden"}
          className="sm:hidden"
        >
          {/*
            Viewport strip:
              - negative horizontal margin to bleed to edges
              - horizontal overflow + snap
              - scrollbar hidden via [&::-webkit-scrollbar]:hidden + [scrollbar-width:none]
          */}
          <div
            className={[
              "-mx-6 px-6",
              "overflow-x-auto overflow-y-visible",
              "scroll-smooth snap-x snap-mandatory",
              "[scroll-padding-inline:1.5rem]",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "overscroll-x-contain",
              "[-webkit-overflow-scrolling:touch]",
            ].join(" ")}
            onTouchStart={pauseAutoplay}
            onTouchEnd={() => resumeAutoplayLater()}
            onMouseDown={pauseAutoplay}
            onMouseUp={() => resumeAutoplayLater()}
            onPointerDown={pauseAutoplay}
            onPointerUp={() => resumeAutoplayLater()}
          >
            {/* Track */}
            <div
              ref={mobileTrackRef}
              className="flex items-stretch gap-[14px] w-max py-1"
            >
              {HOMEPAGE_CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  variants={vCard}
                  // ~88vw wide, capped at 430px, 3:2 aspect ratio, snap-start
                  className="w-[min(88vw,430px)] aspect-[3/2] snap-start flex-none"
                >
                  <CategoryCard
                    cat={cat}
                    locale={locale}
                    discover={discover}
                    index={i}
                    panoramic
                    cardRef={(el) => {
                      mobileCardRefs.current[i] = el;
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress bars */}
          <div className="flex gap-1.5 items-center mt-3.5 px-6">
            {HOMEPAGE_CATEGORIES.map((cat, i) => (
              <div
                key={cat.id}
                className="h-[3px] rounded-full bg-[rgba(26,60,158,0.12)] overflow-hidden flex-1 max-w-[42px]"
              >
                <span
                  className="block h-full rounded-[inherit] bg-[#e30613] transition-[transform,opacity] duration-[350ms] ease-in-out origin-left"
                  style={{
                    transform: `scaleX(${activeIndex === i ? 1 : 0.28})`,
                    opacity: activeIndex === i ? 1 : 0.6,
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Desktop grid (hidden < sm) ── */}
        <motion.div
          variants={vStagger}
          initial={prefersReducedMotion ? false : "hidden"}
          animate={headerInView ? "visible" : "hidden"}
          className="hidden sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:pb-10"
        >
          {HOMEPAGE_CATEGORIES.map((cat, i) => (
            <div
              key={cat.id}
              className={`aspect-[3/2] ${i % 2 !== 0 ? "lg:translate-y-8" : ""}`}
            >
              <motion.div variants={vCard} className="h-full">
                <CategoryCard
                  cat={cat}
                  locale={locale}
                  discover={discover}
                  index={i}
                />
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
