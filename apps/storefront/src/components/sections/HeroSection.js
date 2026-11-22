"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";

/* ═══════════════════════════════════════════════════════════════════
   IMAGE PATHS
═══════════════════════════════════════════════════════════════════ */
const ALL_IMAGES = [
  "/hero/hero1.png",
  "/hero/hero2.png",
  "/hero/hero3.png",
  "/hero/hero4.png",
  "/hero/hero5.png",
  "/hero/hero6.png",
  "/hero/hero7.png",
];

/* Desktop — 3 vertical columns (UNCHANGED) */
const COL_LEFT = [
  ALL_IMAGES[0],
  ALL_IMAGES[3],
  ALL_IMAGES[6],
  ALL_IMAGES[1],
  ALL_IMAGES[4],
];
const COL_MIDDLE = [
  ALL_IMAGES[1],
  ALL_IMAGES[4],
  ALL_IMAGES[0],
  ALL_IMAGES[5],
  ALL_IMAGES[2],
];
const COL_RIGHT = [
  ALL_IMAGES[2],
  ALL_IMAGES[5],
  ALL_IMAGES[3],
  ALL_IMAGES[6],
  ALL_IMAGES[0],
];

/* ═══════════════════════════════════════════════════════════════════
   VERTICAL SCROLL COLUMN — Desktop only (UNCHANGED)
═══════════════════════════════════════════════════════════════════ */
function VerticalColumn({
  images,
  direction = "up",
  speed = 30,
  className = "",
}) {
  const doubled = [...images, ...images];
  const isUp = direction === "up";
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="flex flex-col gap-5 lg:gap-6"
        animate={{ y: isUp ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{
          y: {
            duration: speed,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          },
        }}
        style={{ willChange: "transform" }}
      >
        {doubled.map((src, i) => (
          <div
            key={`v-${src}-${i}`}
            className="relative w-full aspect-[4/3] flex-shrink-0 overflow-hidden rounded-md border border-blue-200/70 bg-white shadow-[0_8px_24px_rgba(var(--rgb-brand-deep),0.07)] transition-colors duration-300 lg:rounded-md"
          >
            <Image
              src={src}
              alt="Premium mattress"
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 33vw, 0px"
              quality={75}
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL CUE (UNCHANGED)
═══════════════════════════════════════════════════════════════════ */
function ScrollCue() {
  return (
    <motion.div
      className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
    >
      <div className="flex h-8 w-5 items-start justify-center rounded-full border border-blue-950/20 bg-white/50 pt-1.5">
        <motion.div
          className="h-1.5 w-1 rounded-full bg-blue-600/60"
          animate={{ y: [0, 8, 0], opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MOBILE HERO — new concept
   ─────────────────────────────────────────────────────────────────
   Vertical composition, top → bottom:

   ① Brand strip    — eyebrow label, centred, top breathing room
   ② Hero card      — large featured product image, rounded, elevated
                      Two small secondary cards peek from behind at offset
                      angles — depth without chaos
   ③ Text block     — headline + description on clean white, no image
                      competing behind it
   ④ CTA block      — primary full-width, secondary text-only link below
   ⑤ Scroll cue     — minimal dot, bottom centre

   Why better than the horizontal rows:
   — One focal point (the main card) instead of 3 competing rows
   — Text has its own clean zone — nothing behind it
   — Depth comes from the stacked card arrangement, not motion
   — CTA placement follows natural thumb reach on mobile
   — No blur, no heavy filters, no overflow chaos
═══════════════════════════════════════════════════════════════════ */
function MobileHero({
  locale,
  isRTL,
  reduced,
  titleLine1,
  titleHighlight,
  description,
  shop,
  collection,
  router,
  floatingBadge,
}) {
  const EX = [0.22, 1, 0.36, 1];

  const vContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13, delayChildren: 0 } },
  };
  const vUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EX } },
  };
  const vCard = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease: EX },
    },
  };
  /* Secondary cards slide in from their side */
  const vLeft = {
    hidden: { opacity: 0, x: -40, rotate: -2 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: -4,
      transition: { duration: 0.85, ease: EX, delay: 0.25 },
    },
  };
  const vRight = {
    hidden: { opacity: 0, x: 40, rotate: 2 },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 4,
      transition: { duration: 0.85, ease: EX, delay: 0.25 },
    },
  };

  return (
    <section
      className="relative flex min-h-svh flex-col overflow-hidden  lg:hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <motion.div
        className="relative z-10 flex flex-col flex-1 pt-6 pb-8"
        variants={vContainer}
        initial={reduced ? "visible" : "hidden"}
        animate="visible"
      >
        <motion.p
          variants={vUp}
          className="mb-5 px-5 text-center text-[9px] uppercase tracking-[0.5em] text-blue-900/40"
        ></motion.p>

        {/* ② CARD STACK — fan arrangement, more dramatic depth */}
        {/*
          Layout: primary card centered, slightly larger.
          Left card: rotated -4°, pushed left, lower z.
          Right card: rotated +4°, pushed right, lower z.
          They fan out like a hand of cards — premium, intentional.
        */}
        <div
          className="relative flex items-end justify-center mb-10 mx-auto w-full"
          style={{ height: "clamp(190px, 52vw, 260px)" }}
        >
          {/* LEFT secondary card */}
          <motion.div
            variants={reduced ? {} : vLeft}
            className="absolute overflow-hidden rounded-md border border-blue-200/50 bg-white"
            style={{
              width: "clamp(130px, 38vw, 180px)",
              aspectRatio: "4/3",
              left: "2vw",
              bottom: 0,
              zIndex: 1,
              boxShadow: "0 8px 28px rgba(var(--rgb-brand-primary),0.12)",
            }}
          >
            <Image
              src={ALL_IMAGES[2]}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 38vw, 200px"
              quality={70}
              loading="lazy"
            />
            {/* Subtle dim overlay so it reads as secondary */}
            <div className="absolute inset-0 bg-white/20" />
          </motion.div>

          {/* RIGHT secondary card */}
          <motion.div
            variants={reduced ? {} : vRight}
            className="absolute overflow-hidden rounded-md border border-blue-200/50 bg-white"
            style={{
              width: "clamp(130px, 38vw, 180px)",
              aspectRatio: "4/3",
              right: "2vw",
              bottom: 0,
              zIndex: 1,
              boxShadow: "0 8px 28px rgba(var(--rgb-brand-primary),0.12)",
            }}
          >
            <Image
              src={ALL_IMAGES[6]}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 38vw, 200px"
              quality={70}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-white/20" />
          </motion.div>

          {/* PRIMARY card — LCP element.
              The Image renders in a static div IMMEDIATELY — not inside motion.div.
              Only the card's shadow/border animates, not the image mount.
              This fixes fetchpriority=high and eliminates 2550ms element render delay. */}
          <div
            className="absolute overflow-hidden rounded-md border border-blue-200/40 bg-white"
            style={{
              width: "clamp(160px, 48vw, 230px)",
              aspectRatio: "4/3",
              bottom: 0,
              zIndex: 3,
            }}
          >
            {/* Shadow animates separately — doesn't block image */}
            <motion.div
              variants={reduced ? {} : vCard}
              className="absolute inset-0 rounded-md"
              style={{
                boxShadow:
                  "0 16px 48px rgba(var(--rgb-brand-primary),0.18), 0 4px 12px rgba(var(--rgb-brand-primary),0.10)",
              }}
            />
            <Image
              src={ALL_IMAGES[0]}
              alt="Empreinte Flex mattress"
              fill
              className="object-cover object-center"
              sizes="(max-width: 390px) 187px, (max-width: 640px) 48vw, 230px"
              quality={75}
              priority
              fetchPriority="high"
            />

            {/* Gradient at bottom of card for the badge */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Cert badge */}
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center">
              <span className="rounded-full border border-blue-200/60 bg-white/90 px-2.5 py-1 text-[7.5px] font-semibold uppercase tracking-[0.35em] text-blue-900 shadow-sm backdrop-blur-sm">
                {floatingBadge}
              </span>
            </div>
          </div>
        </div>

        {/* ③ TEXT BLOCK — white background area, full breathing room */}
        <div className="text-center px-6">
          {/* Thin accent rule above headline — premium editorial detail */}
          <motion.div
            variants={vUp}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <div className="h-px w-10 bg-blue-900/20" />
            <div className="h-1 w-1 rounded-full bg-red-600/60" />
            <div className="h-px w-10 bg-blue-900/20" />
          </motion.div>

          <motion.h1
            variants={vUp}
            className="font-semibold leading-[1.07] tracking-[-0.02em] text-slate-900"
            style={{ fontSize: "clamp(27px, 7vw, 38px)" }}
          >
            {titleLine1 || "Designed for"}
            <br />
            <span className="text-blue-900">
              {titleHighlight || "Deep, Restful Sleep"}
            </span>
          </motion.h1>

          <motion.p
            variants={vUp}
            className="mt-3 text-[12.5px] text-slate-500 leading-relaxed font-light max-w-[260px] mx-auto"
          >
            {description ||
              "Precision-crafted mattresses built to restore your body, night after night."}
          </motion.p>
        </div>

        {/* ④ CTA BLOCK */}
        <motion.div
          variants={vUp}
          className="mt-7 px-5 flex flex-col items-center gap-2.5"
        >
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push(`/${locale}/mattresses`)}
          >
            {shop || "Shop Mattresses"}
          </Button>

          <button
            onClick={() =>
              document
                .getElementById("collections")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="py-1.5 text-[12px] font-medium tracking-wide text-blue-900/50 transition-colors hover:text-blue-900"
          >
            {collection || "View Collection"} {isRTL ? "↑" : "↓"}
          </button>
        </motion.div>

        {/* ⑤ SCROLL DOT */}
        <motion.div
          className="flex justify-center mt-auto pt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-blue-900/15 bg-white/60 pt-1.5">
            <motion.div
              className="h-1.5 w-1 rounded-full bg-blue-900/40"
              animate={{ y: [0, 8, 0], opacity: [1, 0.2, 1] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HERO SECTION — main export
═══════════════════════════════════════════════════════════════════ */
export default function HeroSection({ translation }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const prefersReducedMotion = useReducedMotion();
  const isRTL = locale === "ar";

  const {
    badge,
    titleLine1,
    titleHighlight,
    description,
    shop,
    collection,
    floatingBadge,
  } = translation?.home?.hero || {};

  /* ─── Desktop variants (UNCHANGED) ─── */
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
  };
  const textReveal = prefersReducedMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <>
      {/* ════════════════════════════════════════
          MOBILE / TABLET  (below lg)
          New stacked card composition
      ════════════════════════════════════════ */}
      <MobileHero
        locale={locale}
        isRTL={isRTL}
        reduced={prefersReducedMotion}
        titleLine1={titleLine1}
        titleHighlight={titleHighlight}
        description={description}
        shop={shop}
        collection={collection}
        router={router}
        floatingBadge={floatingBadge}
      />

      {/* ════════════════════════════════════════
          DESKTOP  (lg and above) — UNCHANGED
      ════════════════════════════════════════ */}
      <section className="relative min-h-svh overflow-hidden bg-white hidden lg:block">
        {/* Animated vertical columns */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 z-0">
            <div className="h-full w-full grid grid-cols-3 gap-5 p-5">
              <VerticalColumn
                images={COL_LEFT}
                direction="up"
                speed={35}
                className="h-full"
              />
              <VerticalColumn
                images={COL_MIDDLE}
                direction="down"
                speed={40}
                className="h-full"
              />
              <VerticalColumn
                images={COL_RIGHT}
                direction="up"
                speed={32}
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Reduced motion fallback */}
        {prefersReducedMotion && (
          <div className="absolute inset-0 z-0 grid grid-cols-3 gap-3 p-4 opacity-90">
            {ALL_IMAGES.slice(0, 6).map((src, i) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-md border border-blue-200/70 bg-white shadow-[0_8px_24px_rgba(var(--rgb-brand-deep),0.07)]"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="33vw"
                  priority={i < 3}
                />
              </div>
            ))}
          </div>
        )}

        {/* Light overlays (UNCHANGED) */}
        <div className="absolute inset-0 z-10 bg-white/40" />
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 85% at 50% 50%, rgba(var(--rgb-white),0.08) 20%, rgba(var(--rgb-white),0.45) 72%, rgba(var(--rgb-brand-border),0.18) 100%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white via-white/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/75 to-transparent z-10 pointer-events-none" />

        {/* Content (UNCHANGED) */}
        <div className="relative z-20 min-h-svh flex flex-col items-center justify-center px-6 sm:px-8 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            variants={containerVariants}
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
          >
            <motion.h1
              variants={textReveal}
              className="font-semibold leading-[1.05] tracking-[-0.02em] text-slate-900"
              style={{ fontSize: "clamp(32px, 6.5vw, 72px)" }}
            >
              {titleLine1 || "Designed for"}
              <br />
              <span className="font-bold text-blue-900">
                {titleHighlight || "Deep, Restful Sleep"}
              </span>
            </motion.h1>

            <motion.p
              variants={textReveal}
              className="mt-5 sm:mt-6 text-[14px] sm:text-[16px] lg:text-[17px] text-slate-600 max-w-lg mx-auto leading-relaxed font-light"
            >
              {description ||
                "Precision-crafted mattresses engineered with breathable layers, adaptive support systems, and refined materials — built to restore your body night after night."}
            </motion.p>

            <motion.div
              variants={textReveal}
              className="mt-9 sm:mt-11 flex flex-col sm:flex-row justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  className="relative w-full transition-shadow hover:shadow-[0_0_24px_rgba(var(--rgb-danger),0.18)] sm:w-auto"
                  onClick={() => router.push(`/${locale}/mattresses`)}
                >
                  {shop || "Shop Mattresses"}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto transition-colors"
                  onClick={() =>
                    document
                      .getElementById("collections")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {collection || "View Collection"}
                </Button>
              </motion.div>
            </motion.div>

          </motion.div>
        </div>

        <ScrollCue />
      </section>
    </>
  );
}
