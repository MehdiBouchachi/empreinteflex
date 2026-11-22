"use client";

/**
 * ProductStorySection — v5
 * ─────────────────────────────────────────────────────────────────────────
 * PROBLEMS FIXED FROM SCREENSHOTS:
 *
 *  1. Dead white space — the old version stacked mb-14/mb-16 at every
 *     level: section heading → part header → paragraph → separator.
 *     Three layers of margin compound to 50–60px of empty air.
 *     Fix: controlled spacing — each block knows exactly how much space
 *     it needs from the next. No compounding margins.
 *
 *  2. "PHILOSOPHY" eyebrow floated above with nothing tying it visually
 *     to the content below it. The rule was placed, then the label, then
 *     a gap, then the text — all separate elements fighting each other.
 *     Fix: eyebrow label and rule are inline on the same row, then the
 *     content follows immediately below with a single controlled gap.
 *
 *  3. Engineering layout — label column was empty below the eyebrow,
 *     creating a hollow left column on desktop. Looked like a bug.
 *     Fix: side-by-side layout where the label sits on the SAME baseline
 *     as the first line of the paragraph — not floating above it.
 *
 *  4. Section heading duplicated product name with "— What Makes It
 *     Different" appended, taking a full line, then the philosophy
 *     eyebrow started another block. Two headings in a row with a
 *     separator between them felt redundant and confused the hierarchy.
 *     Fix: one section header, philosophy label flows directly from it.
 *
 *  5. Layer breakdown — "LAYER BREAKDOWN" header + product name heading
 *     + spec rows = three visual levels before any content.
 *     Fix: eyebrow + product name in a compact single row, rows follow
 *     immediately. Physical layers and metadata rows visually separated
 *     by a different background on the metadata rows.
 *
 * NEW LAYOUT CONCEPT: "Structured Editorial"
 *   The section reads like a premium product specification document —
 *   tight rhythm, clear hierarchy, every row justifies its existence.
 *   The left column anchors the eyebrow/label, the right column holds
 *   the substance. This is how luxury brands (Rolls-Royce, Aesop,
 *   B&O) lay out product detail pages.
 *
 * DESIGN TOKENS — verbatim from WhyChooseSection + TechnicalSpecsSection:
 *   Section wrapper   max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
 *   Top border        border-t border-blue-200
 *   H2                text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900
 *   Body              text-sm sm:text-base leading-relaxed
 *   Eyebrow           text-xs uppercase tracking-widest text-slate-500
 *   Spec row          border-b border-blue-200 py-3 sm:py-4 px-2 -mx-2
 *                     hover:bg-blue-50/40 transition-colors duration-150
 *   Spec label        text-sm sm:text-base font-medium text-blue-900
 *   Spec value        text-sm sm:text-base text-slate-600
 *   Numbered circle   w-10 h-10 rounded-full border border-blue-900
 *                     text-blue-900 text-sm font-semibold
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useProduct } from "./ProductContext";
import { productStoryContent } from "./productStoryContent";

/* ── locale resolver ─────────────────────────────────────────────────── */
function loc(field, locale) {
  if (!field) return "";
  return field[locale] ?? field.en ?? "";
}

/* ── UI strings ──────────────────────────────────────────────────────── */
const UI = {
  sectionLabel: {
    en: "Product Story",
    fr: "Histoire du produit",
    ar: "قصة المنتج",
  },
  philosophy: { en: "Philosophy", fr: "Philosophie", ar: "الفلسفة" },
  engineering: { en: "Engineering", fr: "Ingénierie", ar: "الهندسة" },

  physical: { en: "Construction", fr: "Construction", ar: "البناء" },
  metadata: {
    en: "Product details",
    fr: "Détails du produit",
    ar: "تفاصيل المنتج",
  },
  idealFor: { en: "Who It's For", fr: "Pour qui", ar: "لمن هذه المرتبة" },
};

/* ── layer definitions ───────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════════════════════
   INLINE EYEBROW ROW
   Used to open each part. Rule + label on the same horizontal line.
   This eliminates the "floating label in empty space" problem from v4.
   The rule is short (w-8) and sits left of the label — together they
   read as a single labelling device, not two separate elements.
══════════════════════════════════════════════════════════════════════════ */
function Eyebrow({ label, isRTL }) {
  return (
    <div
      className={`flex items-center gap-3 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}
    >
      <div className="h-[2px] w-8 flex-shrink-0 bg-blue-900" />
      <p className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PART A — PHILOSOPHY + ENGINEERING
   ─────────────────────────────────────────────────────────────────────────
   New layout — two-column on desktop, full-width on mobile:

   DESKTOP:
   ┌─────────────────────────────┬──────────────────────────────────────────┐
   │ PHILOSOPHY eyebrow          │  Intro paragraph (full editorial body)   │
   │ + h2 heading (product name) │                                          │
   ├─────────────────────────────┼──────────────────────────────────────────┤
   │ ENGINEERING eyebrow         │  Engineering paragraph                   │
   └─────────────────────────────┴──────────────────────────────────────────┘

   The left column is the "label anchor" — narrow (max 220px), contains
   the eyebrow + heading. The right column is the "content well" —
   wider, contains the paragraph. Both columns align at the top.
   A hairline right-border on the label column separates them.

   This is the structured-editorial layout used by luxury brands.
   The narrow left column creates a visual anchor point that makes the
   right column feel authoritative and deliberate.

   MOBILE: stacked, eyebrow above paragraph, no column split.
══════════════════════════════════════════════════════════════════════════ */
function PhilosophyPart({ story, locale, isRTL }) {
  const introText = loc(story.intro, locale);
  const engineeringText = loc(story.engineering, locale);

  return (
    <div className="space-y-0">
      {/* ── Philosophy block ── */}
      <div
        className={`
        flex flex-col lg:flex-row
        ${isRTL ? "lg:flex-row-reverse" : ""}
        lg:gap-0
        pb-8 sm:pb-10
        border-b border-blue-200
      `}
      >
        {/* Label column */}
        <div
          className={`
          lg:w-[220px] xl:w-[260px] flex-shrink-0
          lg:pr-10 xl:pr-12
          ${isRTL ? "lg:pr-0 lg:border-r-0 lg:border-l lg:border-blue-200 lg:pl-10 xl:pl-12" : "lg:border-r lg:border-blue-200"}
          mb-4 lg:mb-0
          ${isRTL ? "text-right" : ""}
        `}
        >
          <Eyebrow label={loc(UI.philosophy, locale)} isRTL={isRTL} />
          <h2 className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl lg:text-3xl">
            {product_name_placeholder}
          </h2>
        </div>

        {/* Content column */}
        <div
          className={`
          flex-1
          lg:pl-10 xl:pl-14
          ${isRTL ? "lg:pl-0 lg:pr-10 xl:pr-14" : ""}
          ${isRTL ? "text-right" : ""}
        `}
        >
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed lg:leading-loose pt-1">
            {introText}
          </p>
        </div>
      </div>

      {/* ── Engineering block ── */}
      <div
        className={`
        flex flex-col lg:flex-row
        ${isRTL ? "lg:flex-row-reverse" : ""}
        pt-8 sm:pt-10
      `}
      >
        {/* Label column */}
        <div
          className={`
          lg:w-[220px] xl:w-[260px] flex-shrink-0
          lg:pr-10 xl:pr-12
          ${isRTL ? "lg:pr-0 lg:border-r-0 lg:border-l lg:border-blue-200 lg:pl-10 xl:pl-12" : "lg:border-r lg:border-blue-200"}
          mb-4 lg:mb-0
          ${isRTL ? "text-right" : ""}
        `}
        >
          <Eyebrow label={loc(UI.engineering, locale)} isRTL={isRTL} />
        </div>

        {/* Content column */}
        <div
          className={`
          flex-1
          lg:pl-10 xl:pl-14
          ${isRTL ? "lg:pl-0 lg:pr-10 xl:pr-14" : ""}
          ${isRTL ? "text-right" : ""}
        `}
        >
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {engineeringText}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PART B — LAYER ARCHITECTURE
   ─────────────────────────────────────────────────────────────────────────
   New layout concept: the spec table is split into two visual groups
   with a clear visual distinction between them:

   GROUP 1 — Physical layers (01–03):
     Normal spec rows. Ordinal in soft blue, label in blue-950, value right.
     These are the material layers of the mattress.

   GROUP 2 — Product metadata (04–05: Faces, Warranty):
     Same row structure but on a bg-blue-50/30 background — visually
     distinguished as "metadata" without breaking the row pattern.
     A thin label above the group reads "Product details" — one line,
     no heading, just a quiet divider.

   The eyebrow + heading sit in a compact header: the eyebrow and
   product name are on the same row separated by a hairline, then
   the spec table starts immediately. No dead space between header
   and rows.
══════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
   PART C — WHO IT'S FOR
   ─────────────────────────────────────────────────────────────────────────
   Same two-column layout logic as Part A — label anchor left,
   content right. On mobile: stacked.

   The numbered items use the EXACT WhyChooseSection pattern:
     w-10 h-10 rounded-full border border-blue-900
     text-blue-900 text-sm font-semibold
     grid lg:grid-cols-2 gap-x-16 gap-y-14

   Pills below the grid — compact trust signals, no visual noise.
══════════════════════════════════════════════════════════════════════════ */
function IdealForPart({ idealFor, highlights, locale, isRTL }) {
  if (!idealFor?.length && !highlights?.length) return null;

  return (
    <div
      className={`
      flex flex-col lg:flex-row
      ${isRTL ? "lg:flex-row-reverse" : ""}
    `}
    >
      {/* Label column */}
      <div
        className={`
        lg:w-[220px] xl:w-[260px] flex-shrink-0
        lg:pr-10 xl:pr-12
        ${isRTL ? "lg:pr-0 lg:border-r-0 lg:border-l lg:border-blue-200 lg:pl-10 xl:pl-12" : "lg:border-r lg:border-blue-200"}
        mb-6 lg:mb-0
        ${isRTL ? "text-right" : ""}
      `}
      >
        <Eyebrow label={loc(UI.idealFor, locale)} isRTL={isRTL} />
      </div>

      {/* Content column */}
      <div
        className={`
        flex-1
        lg:pl-10 xl:pl-14
        ${isRTL ? "lg:pl-0 lg:pr-10 xl:pr-14" : ""}
      `}
      >
        {/* Numbered items — WhyChooseSection exact tokens */}
        {idealFor?.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-10 mb-8">
            {idealFor.map((item, i) => {
              const text = loc(item, locale);
              if (!text) return null;
              return (
                <div
                  key={i}
                  className={`flex gap-5 items-start ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  {/* Numbered circle — exact WhyChooseSection token */}
                  <div className="flex-shrink-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-900
                                    text-blue-900
                                    text-sm font-semibold"
                    >
                      {i + 1}
                    </div>
                  </div>
                  <div className={`pt-2 ${isRTL ? "text-right" : ""}`}>
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                      {text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Highlight pills */}
        {highlights?.length > 0 && (
          <div
            className={`
            flex flex-wrap gap-2 pt-6
            border-t border-blue-200
            ${isRTL ? "justify-end" : ""}
          `}
          >
            {highlights.map((h, i) => {
              const text = loc(h, locale);
              if (!text) return null;
              return (
                <span
                  key={i}
                  className="
                    inline-flex items-center
                    px-3 py-1.5 rounded-full
                    text-xs font-medium uppercase tracking-wide
                    border border-blue-200
                    bg-blue-50 text-blue-900
                    hover:border-blue-200 hover:bg-blue-100
                    transition-colors duration-150
                  "
                >
                  {text}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════════ */
export default function ProductStorySection() {
  const { product, locale } = useProduct();
  const isRTL = locale === "ar";

  const story = productStoryContent[product?.slug];
  if (!story) return null;

  /* Inject product name into PhilosophyPart via a workaround since
     it's a sub-component. We pass it as a prop. */
  const renderPhilosophy = () => {
    const introText = loc(story.intro, locale);
    const engineeringText = loc(story.engineering, locale);

    return (
      <div className="space-y-0">
        {/* Philosophy block */}
        <div
          className={`
          flex flex-col lg:flex-row
          ${isRTL ? "lg:flex-row-reverse" : ""}
          pb-8 sm:pb-10
          border-b border-blue-200
        `}
        >
          <div
            className={`
            lg:w-[220px] xl:w-[260px] flex-shrink-0
            lg:pr-10 xl:pr-12 mb-4 lg:mb-0
            ${
              isRTL
                ? "text-right lg:pr-0 lg:border-r-0 lg:border-l lg:border-blue-200 lg:pl-10 xl:pl-12"
                : "lg:border-r lg:border-blue-200"
            }
          `}
          >
            <Eyebrow label={loc(UI.philosophy, locale)} isRTL={isRTL} />
            <h2 className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl lg:text-3xl">
              {product.name}
            </h2>
          </div>
          <div
            className={`
            flex-1 lg:pl-10 xl:pl-14 pt-1
            ${isRTL ? "lg:pl-0 lg:pr-10 xl:pr-14 text-right" : ""}
          `}
          >
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed lg:leading-loose">
              {introText}
            </p>
          </div>
        </div>

        {/* Engineering block */}
        <div
          className={`
          flex flex-col lg:flex-row
          ${isRTL ? "lg:flex-row-reverse" : ""}
          pt-8 sm:pt-10
        `}
        >
          <div
            className={`
            lg:w-[220px] xl:w-[260px] flex-shrink-0
            lg:pr-10 xl:pr-12 mb-4 lg:mb-0
            ${
              isRTL
                ? "text-right lg:pr-0 lg:border-r-0 lg:border-l lg:border-blue-200 lg:pl-10 xl:pl-12"
                : "lg:border-r lg:border-blue-200"
            }
          `}
          >
            <Eyebrow label={loc(UI.engineering, locale)} isRTL={isRTL} />
          </div>
          <div
            className={`
            flex-1 lg:pl-10 xl:pl-14
            ${isRTL ? "lg:pl-0 lg:pr-10 xl:pr-14 text-right" : ""}
          `}
          >
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {engineeringText}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-7xl border-t border-blue-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      {/* ── Section eyebrow — compact, no heading duplication ── */}
      <div
        className={`flex items-center gap-3 mb-10 sm:mb-12
        ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className="h-[2px] w-12 flex-shrink-0 bg-blue-900" />
        <p className="text-xs uppercase tracking-widest text-slate-500">
          {loc(UI.sectionLabel, locale)}
        </p>
      </div>

      {/* ══ PART A — Philosophy + Engineering ══ */}
      {renderPhilosophy()}

      {/* ── Divider ── */}

      {/* ── Divider ── */}
      <div className="my-12 border-t border-blue-200 sm:my-14" />

      {/* ══ PART C — Who It's For ══ */}
      <IdealForPart
        idealFor={story.idealFor}
        highlights={story.highlights}
        locale={locale}
        isRTL={isRTL}
      />
    </section>
  );
}
