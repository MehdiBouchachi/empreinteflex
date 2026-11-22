// ─────────────────────────────────────────────────────────────────────────────
// TestimonialsSection.js
//
// A social-proof strip of real WhatsApp screenshots.
//
// Typography & rhythm follow the rest of the homepage sections:
//   • blue eyebrow  (like WhyLitmadSection)
//   • headingClasses({ size: "h1" })  → Playfair, semibold, slate-900
//   • slate subheading, standard section padding
//   • scroll reveals via the shared <Reveal> island (CSS-only motion)
//
// Layout:
//   • Desktop (lg+): a calm auto-scrolling marquee, pauses on hover.
//   • Mobile (< lg): a simple snap swipe-row.
// Both are pure CSS — this stays a server component.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import Reveal from "./Reveal";
import { headingClasses } from "../ui/Heading";

/* ── Copy ─────────────────────────────────────────────────────────────── */
const COPY = {
  en: {
    eyebrow: "Real customer messages",
    heading: "Comfort, confirmed on WhatsApp.",
    subheading:
      "Unedited screenshots from real customers — written to us moments after their Empreinte Flex was delivered.",
    cardLabel: "Verified Customer",
    ratingCount: "based on 1,200+ reviews",
  },
  fr: {
    eyebrow: "Messages de vrais clients",
    heading: "Le confort, confirmé sur WhatsApp.",
    subheading:
      "Des captures d’écran authentiques de clients — envoyées quelques instants après la réception de leur Empreinte Flex.",
    cardLabel: "Client vérifié",
    ratingCount: "sur plus de 1 200 avis",
  },
  ar: {
    eyebrow: "رسائل من عملاء حقيقيين",
    heading: "الراحة… مؤكَّدة عبر واتساب.",
    subheading:
      "لقطات شاشة حقيقية من عملاء راسلونا بعد لحظات من استلام مرتبة Empreinte Flex.",
    cardLabel: "عميل موثّق",
    ratingCount: "بناءً على أكثر من 1200 تقييم",
  },
};

/* ── Screenshots (all 540×1170) ───────────────────────────────────────── */
const MESSAGES = [
  "/messages/message-1.jpg",
  "/messages/message-2.jpg",
  "/messages/message-3.jpg",
  "/messages/message-4.jpg",
  "/messages/message-5.jpg",
  "/messages/message-6.jpg",
  "/messages/message-7.jpg",
  "/messages/message-8.jpg",
  "/messages/message-9.jpeg",
];

const CARD_RATIO = "540 / 1170"; // exact screenshot ratio — show the full conversation

/* ── Icons ────────────────────────────────────────────────────────────── */
function WhatsAppIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function StarIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 0.5l1.545 3.13 3.455.502-2.5 2.437.59 3.44L6 8.385l-3.09 1.624.59-3.44L1 4.132l3.455-.502L6 0.5z" />
    </svg>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────── */
function CardChrome({ label }) {
  return (
    <div
      className="flex items-center justify-between border-b border-blue-50 px-3 py-2.5"
      style={{
        background:
          "linear-gradient(to bottom, var(--color-surface-panel), var(--color-surface-base))",
      }}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <WhatsAppIcon className="h-3 w-3 shrink-0 text-green-500" />
        <span className="truncate text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em] text-slate-400">
          {label}
        </span>
      </div>
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5"
        style={{
          background: "var(--color-whatsapp-surface)",
          border: "1px solid rgba(var(--rgb-whatsapp),0.2)",
        }}
      >
        <span
          className="inline-block h-[5px] w-[5px] rounded-full"
          style={{ background: "var(--color-whatsapp)" }}
          aria-hidden="true"
        />
        <span
          className="text-[8.5px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "var(--color-success)" }}
        >
          Verified
        </span>
      </span>
    </div>
  );
}

function Card({ src, label, sizes }) {
  return (
    <article
      className="tm-card overflow-hidden rounded-md bg-white"
      style={{ border: "1px solid rgba(var(--rgb-brand-border),0.7)" }}
      aria-label={label}
    >
      <CardChrome label={label} />
      <div
        className="relative w-full bg-slate-50"
        style={{ aspectRatio: CARD_RATIO }}
      >
        <Image
          src={src}
          alt={label}
          fill
          sizes={sizes}
          className="object-contain"
          loading="lazy"
        />
      </div>
    </article>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */
export default function TestimonialsSection({ locale = "fr" }) {
  const t = COPY[locale] ?? COPY.fr;
  const isRTL = locale === "ar";

  // Duplicated once so the CSS marquee loops seamlessly (translateX -50%).
  const marqueeItems = [...MESSAGES, ...MESSAGES];

  return (
    <section
      className="relative overflow-hidden bg-slate-50/40 py-10 sm:py-16 lg:py-20"
      dir={isRTL ? "rtl" : "ltr"}
      aria-label={t.heading}
    >
      <style>{`
        .tm-wrap { position: relative; overflow: visible; }
        .tm-wrap::before, .tm-wrap::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 7%;
          z-index: 40;
          pointer-events: none;
        }
        .tm-wrap::before { left: 0; background: linear-gradient(to right, var(--color-surface-base), transparent); }
        .tm-wrap::after { right: 0; background: linear-gradient(to left, var(--color-surface-base), transparent); }
        .tm-track { animation: tm-marquee 70s linear infinite; }
        .tm-wrap:hover .tm-track { animation-play-state: paused; }
        [dir="rtl"] .tm-track { animation-name: tm-marquee-rtl; }
        @keyframes tm-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes tm-marquee-rtl {
          from { transform: translateX(0); }
          to { transform: translateX(50%); }
        }
        .tm-card {
          position: relative;
          z-index: 1;
          box-shadow: 0 2px 12px rgba(var(--rgb-brand-primary),0.06);
          transition: box-shadow 0.25s ease;
        }
        @media (hover: hover) {
          .tm-card:hover {
            z-index: 30;
            box-shadow: 0 8px 24px rgba(var(--rgb-brand-primary),0.12);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .tm-track { animation: none; }
          .tm-wrap { overflow-x: auto; }
          .tm-card { transition: none; }
        }
      `}</style>
      {/* ── Header ── */}
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 sm:gap-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Reveal
            as="p"
            className="reveal-badge mb-2 text-[10px] uppercase tracking-[0.24em] text-blue-900 sm:mb-3 sm:text-xs sm:tracking-[0.4em]"
          >
            {t.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            delay={120}
            className={headingClasses({ size: "h2" })}
          >
            {t.heading}
          </Reveal>
          <Reveal
            as="p"
            delay={240}
            className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:mt-3 sm:text-base"
          >
            {t.subheading}
          </Reveal>
        </div>

        <Reveal
          as="div"
          delay={120}
          className="flex shrink-0 items-center gap-2 lg:pb-1"
        >
          <div
            className="flex gap-0.5"
            style={{ color: "var(--color-danger)" }}
          >
            {[0, 1, 2, 3, 4].map((s) => (
              <StarIcon key={s} className="h-4 w-4" />
            ))}
          </div>
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">4.9/5</span>
            <span className="text-slate-400"> · </span>
            {t.ratingCount}
          </span>
        </Reveal>
      </div>

      {/* ── Desktop marquee ── */}
      <div className="mt-6 hidden lg:block sm:mt-8">
        <div className="tm-wrap">
          <div className="tm-track flex w-max py-2">
            {marqueeItems.map((src, i) => (
              <div key={i} className="w-[190px] shrink-0 pe-4">
                <Card src={src} label={t.cardLabel} sizes="190px" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile swipe row ── */}
      <div className="mt-6 lg:hidden sm:mt-8">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:gap-4 sm:px-8">
          {MESSAGES.map((src) => (
            <div
              key={src}
              className="w-[44vw] max-w-[180px] shrink-0 snap-start sm:w-[48vw] sm:max-w-[220px]"
            >
              <Card
                src={src}
                label={t.cardLabel}
                sizes="(max-width: 640px) 44vw, 220px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
