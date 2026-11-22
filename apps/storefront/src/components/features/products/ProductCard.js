import Button from "@/components/ui/Button";
import Link from "next/link";
import { formatPrice } from "@/utils/helpers";
import ProductImage from "@/components/ui/ProductImage";

/* ─── SERVER COMPONENT — no "use client" needed ───────────────────────────
   Supports all 3 pricing types:

   SIMPLE            → shows base_price as exact price (discount applied)
   VARIANT_DIMENSION → shows min–max range from dimension-only variants
   VARIANT_FULL      → shows min–max range from dimension × thickness variants

   mobileLayout prop: "grid" (default) | "list"

   Product tiers (slug-first, name fallback):
     ELITE       → Ressort Prestige, Empreinte Flex Royal Comfort
     SEMI-LUXURY → Ressort Premium, Confort OrthoFlex Max, Ressort Confort
     STANDARD    → all others
────────────────────────────────────────────────────────────────────────── */

/* ─── Tier slug / name registries ─────────────────────────────────────── */
const ELITE_SLUGS = [
  "prestige-spring",
  "ressort-prestige",
  "empreinte-flex-royal-comfort",
];
const SEMI_LUXURY_SLUGS = [
  "ressort-premium",
  "confort-orthoflex-max",
  "ressort-confort",
];

const ELITE_NAMES = ["ressort prestige", "empreinte flex royal comfort"];
const SEMI_LUXURY_NAMES = [
  "ressort premium",
  "confort orthoflex max",
  "ressort confort",
];
const BESTSELLER_SLUGS = ["hr-d45-comfort", "prestige-spring"];

function detectTier(slug, name) {
  const s = (slug || "").toLowerCase().trim();
  const n = (name || "").toLowerCase().trim();

  if (ELITE_SLUGS.includes(s) || ELITE_NAMES.includes(n)) return "elite";
  if (SEMI_LUXURY_SLUGS.includes(s) || SEMI_LUXURY_NAMES.includes(n))
    return "semiLuxury";
  return "standard";
}

function isBestseller(slug) {
  const s = (slug || "").toLowerCase().trim();
  return BESTSELLER_SLUGS.includes(s);
}

function getBestsellerLabel(locale = "en") {
  const currentLocale = (locale || "en").toLowerCase();

  if (currentLocale.startsWith("fr")) return "Meilleure vente";
  if (currentLocale.startsWith("ar")) return "الأكثر مبيعاً";
  return "Bestseller";
}

function applyDiscount(price, discountPct) {
  const value = Number(price) || 0;
  const pct = Number(discountPct) || 0;
  if (pct <= 0) return value;
  return Math.round(value * (1 - pct / 100));
}

function getPromotionLabel(locale = "en") {
  const currentLocale = (locale || "en").toLowerCase();

  if (currentLocale.startsWith("fr")) return "Promotion";
  if (currentLocale.startsWith("ar")) return "تخفيض";
  return "Discount";
}

/* ─── Bestseller badge styles ─────────────────────────────────────────────
   On-palette navy → brand-blue pill with a gold hairline border and gold
   trophy. Sibling of the Prestige badge (navy + gold) but distinct: solid
   fill + white label vs. Prestige's translucent fill + gold label. Sits
   stacked under the tier badge so it never touches the Elite ribbon.
   Tokens only — nothing hardcoded.
────────────────────────────────────────────────────────────────────────── */
const BestsellerStyles = () => (
  <style>{`
    .pc-bestseller-badge {
      position: absolute;
      top: 12px;
      z-index: 14;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 11px 5px 8px;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--color-brand-deep) 0%, var(--color-brand-primary) 100%);
      border: 1px solid rgba(var(--rgb-gold), 0.55);
      box-shadow:
        0 4px 14px rgba(var(--rgb-brand-deep), 0.35),
        inset 0 1px 0 rgba(var(--rgb-white), 0.14);
    }

    /* stack directly beneath the tier badge (Prestige / Premium) */
    .pc-bestseller-badge-stacked { top: 44px; }

    .pc-bestseller-badge-mobile {
      display: none;
    }

    .pc-bestseller-slot {
      display: none;
    }

    @media (max-width: 639px) {
      .pc-bestseller-badge {
        top: 10px;
        min-height: 20px;
        gap: 3px;
        padding: 4px 7px;
      }

      .pc-bestseller-badge-stacked {
        top: auto;
        bottom: 10px;
      }

      .pc-bestseller-badge-image {
        display: none;
      }

      .pc-bestseller-badge-mobile {
        position: relative;
        top: auto;
        right: auto;
        bottom: auto;
        left: auto;
        display: inline-flex;
        align-self: flex-start;
        margin-bottom: 0;
      }

      .pc-bestseller-slot {
        display: flex;
        align-items: flex-start;
        min-height: 28px;
        margin-bottom: 6px;
      }

      .pc-bestseller-badge-text {
        font-size: 8px;
        letter-spacing: 0.04em;
        line-height: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .pc-bestseller-icon {
        width: 10px;
        height: 10px;
      }
    }

    .pc-bestseller-icon { flex-shrink: 0; }

    .pc-bestseller-badge-text {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      line-height: 1;
      white-space: nowrap;
      color: var(--color-product-elite-title);
      max-width: 100%;
    }
  `}</style>
);

/* ─── Shared keyframes + elite styles ─────────────────────────────────── */
const EliteStyles = () => (
  <style>{`
    @keyframes pc-badge-shimmer {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.75; }
    }

    .pc-promo-badge {
      position: absolute;
      left: 12px;
      bottom: 12px;
      z-index: 12;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--color-product-promo-start) 0%, var(--color-product-promo-end) 100%);
      color: white;
      box-shadow: 0 8px 24px rgba(var(--rgb-danger), 0.22);
    }

    .pc-promo-badge-dark {
      background: linear-gradient(135deg, var(--color-product-promo-start) 0%, var(--color-danger-strong) 100%);
      color: white;
    }

    .pc-promo-badge-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      line-height: 1;
    }

    .pc-promo-badge-value {
      font-size: 10px;
      font-weight: 900;
    }

    /* ── ELITE: outer wrapper = animated gold border ── */
    .pc-elite-wrap {
      position: relative;
      border-radius: var(--radius-surface);
      border: 1px solid rgba(var(--rgb-gold), 0.28);
      max-width: 100%;
      box-shadow: 0 2px 12px rgba(var(--rgb-brand-deep), 0.08);
    }

    .pc-elite-inner {
      border-radius: inherit;
      overflow: hidden;
      background: var(--color-brand-deep);
    }

    .pc-elite-ribbon {
      position: absolute;
      top: 12px;
      right: -1px;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px 4px 10px;
      border-radius: 99px 0 0 99px;
      background: linear-gradient(110deg, var(--color-gold-3), var(--color-gold-6), var(--color-gold-3));
      box-shadow: -1px 1px 5px rgba(var(--rgb-gold),0.16);
    }
    .pc-elite-ribbon-rtl {
      right: auto;
      left: -1px;
      border-radius: 0 99px 99px 0;
      padding: 4px 10px 4px 12px;
      box-shadow: 1px 1px 5px rgba(var(--rgb-gold),0.16);
    }
    .pc-elite-ribbon-text {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--color-brand-deep);
    }

    .pc-elite-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px 3px 7px;
      border-radius: 99px;
      background: rgba(var(--rgb-brand-deep),0.82);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(var(--rgb-gold),0.45);
      box-shadow: 0 1px 8px rgba(var(--rgb-black),0.25);
    }
    .pc-elite-badge-text {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      background: linear-gradient(110deg, var(--color-gold-3) 10%, var(--color-gold-6) 55%, var(--color-gold-3) 90%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .pc-elite-muted   { color: var(--color-product-elite-muted); }
    .pc-elite-title   { color: var(--color-product-elite-title); }
    .pc-elite-desc    { color: var(--color-product-elite-muted-strong); }
    .pc-elite-divider { border-color: rgba(var(--rgb-gold),0.18); }

    .pc-elite-price {
      background: linear-gradient(110deg, var(--color-gold-1) 10%, var(--color-gold-4) 55%, var(--color-gold-1) 90%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .pc-elite-cta a button,
    .pc-elite-cta button:not([disabled]) {
      background: var(--color-gold-4) !important;
      color: var(--color-brand-deep) !important;
      font-weight: 700 !important;
      border: none !important;
      box-shadow: none !important;
    }
    .pc-elite-cta a button:hover,
    .pc-elite-cta button:not([disabled]):hover {
      box-shadow: none !important;
    }

    /* ── SEMI-LUXURY styles — elevated blue brand ── */
    .pc-semi-wrap {
      position: relative;
      border-radius: var(--radius-surface);
      border: 1px solid var(--color-product-semi-border);
      box-shadow: 0 2px 10px rgba(var(--rgb-brand-primary),0.06);
      background: var(--color-surface-base);
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }

    .pc-semi-wrap:hover {
      box-shadow: 0 4px 14px rgba(var(--rgb-brand-primary),0.09);
    }

    .pc-semi-inner {
      border-radius: inherit;
      overflow: hidden;
      background: var(--color-surface-base);
    }

    .pc-semi-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px 3px 8px;
      border-radius: 99px;
      background: rgba(var(--rgb-brand-primary),0.88);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border: 1px solid rgba(var(--rgb-white),0.18);
      box-shadow: 0 1px 6px rgba(var(--rgb-brand-primary),0.20);
    }
    .pc-semi-badge-text {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: var(--color-surface-base);
    }

    .pc-semi-accent {
      position: absolute;
      top: 0;
      right: 20px;
      z-index: 10;
      width: 28px;
      height: 3px;
      border-radius: 0 0 3px 3px;
      background: linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-primary-accent));
    }

    .pc-semi-muted   { color: var(--color-text-muted); }
    .pc-semi-title   { color: var(--color-text-primary); }
    .pc-semi-desc    { color: var(--color-text-secondary); }
    .pc-semi-divider { border-color: var(--color-product-semi-divider); }
    .pc-semi-price   { color: var(--color-brand-primary); }

    .pc-semi-cta a button,
    .pc-semi-cta button:not([disabled]) {
      background: var(--color-brand-primary) !important;
      color: var(--color-surface-base) !important;
      font-weight: 600 !important;
      border: none !important;
      box-shadow: 0 2px 10px rgba(var(--rgb-brand-primary),0.28) !important;
    }
    .pc-semi-cta a button:hover,
    .pc-semi-cta button:not([disabled]):hover {
      background: var(--color-brand-primary-dark) !important;
      box-shadow: 0 4px 16px rgba(var(--rgb-brand-primary),0.38) !important;
    }
  `}</style>
);

/* ─── Icons ────────────────────────────────────────────────────────────── */
const CrownIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 20 20"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M2 16h16M3.5 16 5 8l5 4 3.5-7 3.5 7 1.5-4 1.5 8"
      stroke="url(#pcg-elite)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="pcg-elite"
        x1="2"
        y1="16"
        x2="18"
        y2="7"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="var(--color-gold-3)" />
        <stop offset="0.5" stopColor="var(--color-gold-6)" />
        <stop offset="1" stopColor="var(--color-gold-3)" />
      </linearGradient>
    </defs>
  </svg>
);

const StarIcon = () => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 16 16"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.9z"
      fill="rgba(var(--rgb-white),0.90)"
    />
  </svg>
);

/* Gold trophy for the Bestseller pill — distinct from the crown (Prestige)
   and the star (Premium). Gold gradient ties into the elite palette. */
const TrophyIcon = () => (
  <svg
    className="pc-bestseller-icon"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M6 3h12v4.5a6 6 0 0 1-12 0V3Z" fill="url(#pcg-bs)" />
    <path
      d="M6 4.5H4a2 2 0 0 0-2 2 4 4 0 0 0 4 4M18 4.5h2a2 2 0 0 1 2 2 4 4 0 0 1-4 4"
      stroke="url(#pcg-bs)"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M12 13.5v3.4"
      stroke="url(#pcg-bs)"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M7.6 21c0-1.4 2-2.2 4.4-2.2s4.4.8 4.4 2.2H7.6Z"
      fill="url(#pcg-bs)"
    />
    <defs>
      <linearGradient
        id="pcg-bs"
        x1="4"
        y1="3"
        x2="20"
        y2="21"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="var(--color-gold-3)" />
        <stop offset="0.5" stopColor="var(--color-gold-6)" />
        <stop offset="1" stopColor="var(--color-gold-3)" />
      </linearGradient>
    </defs>
  </svg>
);

function PromotionBadge({ locale = "en", discountPct = 0, dark = false }) {
  if (!discountPct || discountPct <= 0) return null;

  return (
    <div className={`pc-promo-badge ${dark ? "pc-promo-badge-dark" : ""}`}>
      <span className="pc-promo-badge-label">{getPromotionLabel(locale)}</span>
      <span className="pc-promo-badge-value">-{discountPct}%</span>
    </div>
  );
}

/* Reusable bestseller pill — inject <BestsellerStyles /> once per bestseller card. */
function BestsellerBadge({ label, className = "" }) {
  return (
    <div
      className={`pc-bestseller-badge ${className}`}
      role="status"
      aria-label={label}
    >
      <TrophyIcon />
      <span className="pc-bestseller-badge-text">{label}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   ProductCard
════════════════════════════════════════════════════════════════════════ */
function ProductCard({
  product,
  translation,
  locale = "en",
  mobileLayout = "grid",
}) {
  const {
    name,
    description,
    images,
    available = true,
    category,
    slug,
    pricingType,
    basePrice,
    priceRange,
    discount,
    details,
  } = product;

  const image = images?.[0];
  const isAvailable = Boolean(available);
  const { soldOut, price: priceLabel, viewProduct, unavailable } = translation;
  const isList = mobileLayout === "list";
  const isRTL = locale.toLowerCase().startsWith("ar");
  const categoryLabel =
    product.categoryTranslations?.[locale] ||
    product.categoryTranslations?.fr ||
    product.categoryTranslations?.en ||
    category;

  const discountPct = Number(discount) || 0;
  const hasDiscount = discountPct > 0;

  /* ── Resolve display price based on pricingType ── */
  let resolvedRange = null;
  let resolvedDiscountedRange = null;
  let resolvedExactPrice = null;
  let resolvedOldPrice = null;

  const effectivePricingType =
    pricingType || (basePrice != null ? "SIMPLE" : "VARIANT_FULL");

  if (effectivePricingType === "SIMPLE") {
    const raw = Number(basePrice) || 0;
    if (hasDiscount) {
      resolvedExactPrice = applyDiscount(raw, discountPct);
      resolvedOldPrice = raw;
    } else {
      resolvedExactPrice = raw;
    }
  } else {
    let rawRange = null;

    if (priceRange) {
      rawRange = {
        min: Number(priceRange.min) || 0,
        max: Number(priceRange.max) || 0,
      };
    } else if (details?.dimensions) {
      const allPrices = details.dimensions.flatMap(
        (d) => d.options?.map((o) => Number(o.price) || 0) ?? [],
      );

      if (allPrices.length > 0) {
        rawRange = {
          min: Math.min(...allPrices),
          max: Math.max(...allPrices),
        };
      }
    }

    if (rawRange) {
      resolvedRange = rawRange;

      if (hasDiscount) {
        resolvedDiscountedRange = {
          min: applyDiscount(rawRange.min, discountPct),
          max: applyDiscount(rawRange.max, discountPct),
        };
      }
    }
  }

  const isExact = resolvedExactPrice !== null;
  const isRange = !isExact && resolvedRange !== null;

  /* ── Tier detection (slug-first, name fallback) ── */
  const tier = detectTier(slug, name);
  const isElite = tier === "elite";
  const isSemiLuxury = tier === "semiLuxury";
  const isPremiumLike = isElite || isSemiLuxury;
  const bestseller = isBestseller(slug);
  const bestsellerLabel = getBestsellerLabel(locale);

  /* ══════════════════════════════════════════════
     STANDARD card
  ══════════════════════════════════════════════ */
  if (!isPremiumLike) {
    return (
      <div
        className={`
          group bg-white
          border border-blue-200 shadow-sm
          overflow-hidden flex h-full
          transition-colors duration-200
          flex-col rounded-md
        `}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* IMAGE */}
        <div className="relative overflow-hidden flex-shrink-0 aspect-[4/3] max-h-[240px] sm:aspect-auto sm:h-44 md:h-48 lg:h-[240px]">
          <Link
            href={`/${locale}/product/${slug}`}
            className="absolute inset-0 block"
              tabIndex={-1}
            aria-hidden="true"
          >
            <ProductImage
              src={image}
              alt=""
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 33vw"
              className={`
                w-full h-full object-cover
                transition-transform duration-700
                ease-[cubic-bezier(0.25,0.4,0.25,1)]
                ${isAvailable ? "" : "grayscale"}
              `}
              priority={false}
              placeholder="empty"
              loading="lazy"
            />
          </Link>

          {bestseller && (
            <>
              <BestsellerStyles />
              <BestsellerBadge
                label={bestsellerLabel}
                className={`pc-bestseller-badge-image ${isRTL ? "right-3" : "left-3"}`}
              />
            </>
          )}

          <PromotionBadge locale={locale} discountPct={discountPct} />

          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40">
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-medium text-blue-900 sm:text-sm">
                {soldOut}
              </span>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-col grow p-2.5 sm:p-5 lg:p-6">
          <div className="pc-bestseller-slot">
            {bestseller && (
              <BestsellerBadge
                label={bestsellerLabel}
                className="pc-bestseller-badge-mobile"
              />
            )}
          </div>

          <p
            className={`text-[9px] sm:text-xs uppercase tracking-wider text-slate-500 mb-1 ${isList ? "block" : "hidden sm:block"}`}
          >
            {categoryLabel}
          </p>

          <Link href={`/${locale}/product/${slug}`}>
            <h3
              className={`
                mb-1.5 line-clamp-2 font-semibold leading-snug text-slate-900 transition-colors duration-200 hover:text-blue-900 sm:mb-2
                ${isList ? "text-base sm:text-base lg:text-lg" : "text-sm sm:text-base lg:text-lg"}
              `}
            >
              {name}
            </h3>
          </Link>

          <p
            className={`text-[12px] sm:text-sm text-slate-600 mb-3 leading-relaxed line-clamp-2 ${isList ? "block" : "hidden sm:block"}`}
          >
            {description}
          </p>

          <div className="mt-auto">
            <div className="mb-2.5 border-t border-blue-200 sm:mb-3" />

            {/* EXACT PRICE (SIMPLE) */}
            {isExact && (
              <div
                className={isList ? "flex items-end justify-between gap-3" : ""}
              >
                <div className="flex flex-col min-w-0">
                  <span
                    className={`uppercase tracking-wider text-slate-500 block mb-0.5 ${isList ? "text-xs" : "text-[10px] sm:text-xs"}`}
                  >
                    {priceLabel}
                  </span>

                  {resolvedOldPrice ? (
                    <>
                      <span
                        className={`text-slate-400 line-through block ${isList ? "text-xs" : "text-[11px] sm:text-xs"}`}
                      >
                        {formatPrice(resolvedOldPrice, locale)}
                      </span>
                      <span
                        className={`font-semibold text-blue-900 ${isList ? "text-lg sm:text-base lg:text-lg" : "text-sm sm:text-base lg:text-lg"}`}
                      >
                        {formatPrice(resolvedExactPrice, locale)}
                      </span>
                    </>
                  ) : (
                    <span
                      className={`font-semibold text-blue-900 ${isList ? "text-lg sm:text-base lg:text-lg" : "text-sm sm:text-base lg:text-lg"}`}
                    >
                      {formatPrice(resolvedExactPrice, locale)}
                    </span>
                  )}
                </div>

                <div className={isList ? "shrink-0" : "mt-2"}>
                  {isAvailable ? (
                    <Link
                      href={`/${locale}/product/${slug}`}
                      className={isList ? "" : "block"}
                    >
                      <Button size="sm" fullWidth={!isList}>
                        {viewProduct}
                      </Button>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className={`text-[10px] rounded-full bg-slate-200 text-slate-400 cursor-not-allowed ${isList ? "px-3 py-1.5" : "w-full px-2.5 py-1.5"}`}
                    >
                      {unavailable}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* RANGE PRICE (VARIANT_FULL / VARIANT_DIMENSION) */}
            {isRange && (
              <div>
                <div className="mb-2 sm:mb-3">
                  <span
                    className={`uppercase tracking-wider text-slate-500 block mb-0.5 ${isList ? "text-xs" : "text-[10px] sm:text-xs"}`}
                  >
                    {priceLabel}
                  </span>

                  {hasDiscount && resolvedDiscountedRange ? (
                    <>
                      <span
                        className={`text-slate-400 line-through block ${isList ? "text-xs" : "text-[11px] sm:text-xs"}`}
                      >
                        {formatPrice(resolvedRange.min, locale)}
                        {resolvedRange.min !== resolvedRange.max &&
                          ` – ${formatPrice(resolvedRange.max, locale)}`}
                      </span>
                      <span
                        className={`font-semibold text-blue-900 ${isList ? "text-lg sm:text-base lg:text-lg" : "text-[12px] sm:text-base lg:text-lg"}`}
                      >
                        {formatPrice(resolvedDiscountedRange.min, locale)}
                        {resolvedDiscountedRange.min !==
                          resolvedDiscountedRange.max &&
                          ` – ${formatPrice(resolvedDiscountedRange.max, locale)}`}
                      </span>
                    </>
                  ) : (
                    <span
                      className={`font-semibold text-blue-900 ${isList ? "text-lg sm:text-base lg:text-lg" : "text-[12px] sm:text-base lg:text-lg"}`}
                    >
                      {formatPrice(resolvedRange.min, locale)}
                      {resolvedRange.min !== resolvedRange.max &&
                        ` – ${formatPrice(resolvedRange.max, locale)}`}
                    </span>
                  )}
                </div>

                {isAvailable ? (
                  <Link href={`/${locale}/product/${slug}`} className="block">
                    <Button size="sm" fullWidth>
                      {viewProduct}
                    </Button>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full px-3 py-1.5 text-[10px] rounded-full bg-slate-200 text-slate-400 cursor-not-allowed"
                  >
                    {unavailable}
                  </button>
                )}
              </div>
            )}

            {!isExact && !isRange && (
              <span className="text-xs text-slate-400">{unavailable}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     SEMI-LUXURY card
  ══════════════════════════════════════════════ */
  if (isSemiLuxury) {
    return (
      <div className="h-full" dir={isRTL ? "rtl" : "ltr"}>
        <EliteStyles />
        <div className="pc-semi-wrap h-full">
          <div className="pc-semi-inner group flex flex-col h-full">
            {/* IMAGE */}
            <div className="relative overflow-hidden flex-shrink-0 aspect-[4/3] max-h-[240px] sm:aspect-auto sm:h-44 md:h-48 lg:h-[240px]">
              <Link
                href={`/${locale}/product/${slug}`}
                className="absolute inset-0 block"
              tabIndex={-1}
                aria-hidden="true"
              >
                <ProductImage
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 33vw"
                  className={`
                    w-full h-full object-cover
                    transition-transform duration-700
                    ease-[cubic-bezier(0.25,0.4,0.25,1)]
                    ${isAvailable ? "" : "grayscale"}
                  `}
                  priority={false}
                  placeholder="empty"
                  loading="lazy"
                />
              </Link>

              <div
                className={`absolute top-3 z-10 pc-semi-badge ${isRTL ? "right-3" : "left-3"}`}
              >
                <StarIcon />
                <span className="pc-semi-badge-text">Premium</span>
              </div>

              {bestseller && (
                <>
                  <BestsellerStyles />
                  <BestsellerBadge
                    label={bestsellerLabel}
                    className={`pc-bestseller-badge-stacked right-3`}
                  />
                </>
              )}

              <div className="pc-semi-accent" />
              <PromotionBadge locale={locale} discountPct={discountPct} />

              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-medium text-blue-900 sm:text-sm">
                    {soldOut}
                  </span>
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="flex flex-col grow p-2.5 sm:p-5 lg:p-6">
              <div className="pc-bestseller-slot">
                {bestseller && (
                  <BestsellerBadge
                    label={bestsellerLabel}
                    className="pc-bestseller-badge-mobile"
                  />
                )}
              </div>

              <p
                className={`text-[9px] sm:text-xs uppercase tracking-wider pc-semi-muted mb-1 ${isList ? "block" : "hidden sm:block"}`}
              >
                {categoryLabel}
              </p>

              <Link href={`/${locale}/product/${slug}`}>
                <h3
                  className={`
                    font-semibold leading-snug mb-1.5 sm:mb-2 pc-semi-title
                    tracking-tight transition-colors duration-200 line-clamp-2
                    hover:opacity-75
                    ${isList ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-lg lg:text-xl"}
                  `}
                >
                  {name}
                </h3>
              </Link>

              <p
                className={`text-[12px] sm:text-sm pc-semi-desc mb-3 leading-relaxed line-clamp-2 ${isList ? "block" : "hidden sm:block"}`}
              >
                {description}
              </p>

              <div className="mt-auto">
                <div className="border-t pc-semi-divider mb-2.5 sm:mb-3" />

                {isExact && (
                  <div
                    className={
                      isList ? "flex items-end justify-between gap-3" : ""
                    }
                  >
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`uppercase tracking-wider pc-semi-muted block mb-0.5 ${isList ? "text-xs" : "text-[10px] sm:text-xs"}`}
                      >
                        {priceLabel}
                      </span>
                      {resolvedOldPrice && (
                        <span
                          className={`text-slate-400 line-through block ${isList ? "text-xs" : "text-[11px] sm:text-xs"}`}
                        >
                          {formatPrice(resolvedOldPrice, locale)}
                        </span>
                      )}
                      <span
                        className={`font-bold pc-semi-price ${isList ? "text-lg sm:text-base lg:text-lg" : "text-sm sm:text-base lg:text-lg"}`}
                      >
                        {formatPrice(resolvedExactPrice, locale)}
                      </span>
                    </div>

                    <div
                      className={`pc-semi-cta ${isList ? "shrink-0" : "mt-2"}`}
                    >
                      {isAvailable ? (
                        <Link
                          href={`/${locale}/product/${slug}`}
                          className={isList ? "" : "block"}
                        >
                          <Button size="sm" fullWidth={!isList}>
                            {viewProduct}
                          </Button>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className={`text-[10px] rounded-full bg-slate-200 text-slate-400 cursor-not-allowed ${isList ? "px-3 py-1.5" : "w-full px-2.5 py-1.5"}`}
                        >
                          {unavailable}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {isRange && (
                  <div>
                    <div className="mb-2 sm:mb-3">
                      <span
                        className={`uppercase tracking-wider pc-semi-muted block mb-0.5 ${isList ? "text-xs" : "text-[10px] sm:text-xs"}`}
                      >
                        {priceLabel}
                      </span>

                      {hasDiscount && resolvedDiscountedRange ? (
                        <>
                          <span
                            className={`text-slate-400 line-through block ${isList ? "text-xs" : "text-[11px] sm:text-xs"}`}
                          >
                            {formatPrice(resolvedRange.min, locale)}
                            {resolvedRange.min !== resolvedRange.max &&
                              ` – ${formatPrice(resolvedRange.max, locale)}`}
                          </span>
                          <span
                            className={`font-bold pc-semi-price ${isList ? "text-lg sm:text-base lg:text-lg" : "text-[12px] sm:text-base lg:text-lg"}`}
                          >
                            {formatPrice(resolvedDiscountedRange.min, locale)}
                            {resolvedDiscountedRange.min !==
                              resolvedDiscountedRange.max &&
                              ` – ${formatPrice(resolvedDiscountedRange.max, locale)}`}
                          </span>
                        </>
                      ) : (
                        <span
                          className={`font-bold pc-semi-price ${isList ? "text-lg sm:text-base lg:text-lg" : "text-[12px] sm:text-base lg:text-lg"}`}
                        >
                          {formatPrice(resolvedRange.min, locale)}
                          {resolvedRange.min !== resolvedRange.max &&
                            ` – ${formatPrice(resolvedRange.max, locale)}`}
                        </span>
                      )}
                    </div>

                    <div className="pc-semi-cta">
                      {isAvailable ? (
                        <Link
                          href={`/${locale}/product/${slug}`}
                          className="block"
                        >
                          <Button size="sm" fullWidth>
                            {viewProduct}
                          </Button>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full px-3 py-1.5 text-[10px] rounded-full bg-slate-200 text-slate-400 cursor-not-allowed"
                        >
                          {unavailable}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!isExact && !isRange && (
                  <span className="text-xs pc-semi-muted">{unavailable}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     ELITE card
  ══════════════════════════════════════════════ */
  return (
    <div className="h-full" dir={isRTL ? "rtl" : "ltr"}>
      <EliteStyles />
      <div className="pc-elite-wrap h-full">
        <div className="pc-elite-inner group flex flex-col h-full">
          {/* IMAGE */}
          <div className="relative overflow-hidden flex-shrink-0 aspect-[4/3] max-h-[240px] sm:aspect-auto sm:h-44 md:h-48 lg:h-[240px]">
            <Link
              href={`/${locale}/product/${slug}`}
              className="absolute inset-0 block"
              tabIndex={-1}
              aria-hidden="true"
            >
              <ProductImage
                src={image}
                alt=""
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 33vw"
                className={`
                  w-full h-full object-cover
                  transition-transform duration-700
                  ease-[cubic-bezier(0.25,0.4,0.25,1)]
                  ${isAvailable ? "" : "grayscale"}
                `}
                priority={false}
                placeholder="empty"
                loading="lazy"
              />
            </Link>

            <div
              className={`absolute top-3 z-10 pc-elite-badge ${isRTL ? "right-3" : "left-3"}`}
            >
              <CrownIcon />
              <span className="pc-elite-badge-text">Prestige</span>
            </div>

            {bestseller && (
              <>
                <BestsellerStyles />
                <BestsellerBadge
                  label={bestsellerLabel}
                  className="pc-bestseller-badge-image pc-bestseller-badge-stacked right-3"
                />
              </>
            )}

            <div
              className={`pc-elite-ribbon ${isRTL ? "pc-elite-ribbon-rtl" : ""}`}
            >
              <span className="pc-elite-ribbon-text">Elite</span>
            </div>

            <PromotionBadge locale={locale} discountPct={discountPct} dark />

            {!isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-950/55">
                <span className="bg-white/10 backdrop-blur text-white text-[10px] sm:text-sm px-3 py-1 rounded-full font-medium border border-white/20">
                  {soldOut}
                </span>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="flex flex-col grow p-2.5 sm:p-5 lg:p-6">
            <div className="pc-bestseller-slot">
              {bestseller && (
                <BestsellerBadge
                  label={bestsellerLabel}
                  className="pc-bestseller-badge-mobile"
                />
              )}
            </div>

            <p
              className={`text-[9px] sm:text-xs uppercase tracking-widest pc-elite-muted mb-1 ${isList ? "block" : "hidden sm:block"}`}
            >
              {categoryLabel}
            </p>

            <Link href={`/${locale}/product/${slug}`}>
              <h3
                className={`
                  font-semibold leading-snug mb-1.5 sm:mb-2 pc-elite-title
                  tracking-tight transition-colors duration-200 line-clamp-2
                  hover:opacity-80
                  ${isList ? "text-base sm:text-lg lg:text-xl" : "text-sm sm:text-lg lg:text-xl"}
                `}
              >
                {name}
              </h3>
            </Link>

            <p
              className={`text-[12px] sm:text-sm pc-elite-desc mb-3 leading-relaxed line-clamp-2 ${isList ? "block" : "hidden sm:block"}`}
            >
              {description}
            </p>

            <div className="mt-auto">
              <div className="border-t pc-elite-divider mb-2.5 sm:mb-3" />

              {isExact && (
                <div
                  className={
                    isList ? "flex items-end justify-between gap-3" : ""
                  }
                >
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`uppercase tracking-widest pc-elite-muted block mb-0.5 ${isList ? "text-xs" : "text-[10px] sm:text-xs"}`}
                    >
                      {priceLabel}
                    </span>
                    {resolvedOldPrice && (
                      <span
                        className={`text-slate-500 line-through block ${isList ? "text-xs" : "text-[11px] sm:text-xs"}`}
                      >
                        {formatPrice(resolvedOldPrice, locale)}
                      </span>
                    )}
                    <span
                      className={`font-bold pc-elite-price ${isList ? "text-lg sm:text-base lg:text-lg" : "text-sm sm:text-base lg:text-lg"}`}
                    >
                      {formatPrice(resolvedExactPrice, locale)}
                    </span>
                  </div>

                  <div
                    className={`pc-elite-cta ${isList ? "shrink-0" : "mt-2"}`}
                  >
                    {isAvailable ? (
                      <Link
                        href={`/${locale}/product/${slug}`}
                        className={isList ? "" : "block"}
                      >
                        <Button size="sm" fullWidth={!isList}>
                          {viewProduct}
                        </Button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className={`text-[10px] rounded-full bg-white/10 text-white/40 cursor-not-allowed ${isList ? "px-3 py-1.5" : "w-full px-2.5 py-1.5"}`}
                      >
                        {unavailable}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isRange && (
                <div>
                  <div className="mb-2 sm:mb-3">
                    <span
                      className={`uppercase tracking-widest pc-elite-muted block mb-0.5 ${isList ? "text-xs" : "text-[10px] sm:text-xs"}`}
                    >
                      {priceLabel}
                    </span>

                    {hasDiscount && resolvedDiscountedRange ? (
                      <>
                        <span
                          className={`text-slate-500 line-through block ${isList ? "text-xs" : "text-[11px] sm:text-xs"}`}
                        >
                          {formatPrice(resolvedRange.min, locale)}
                          {resolvedRange.min !== resolvedRange.max &&
                            ` – ${formatPrice(resolvedRange.max, locale)}`}
                        </span>
                        <span
                          className={`font-bold pc-elite-price ${isList ? "text-lg sm:text-base lg:text-lg" : "text-[12px] sm:text-base lg:text-lg"}`}
                        >
                          {formatPrice(resolvedDiscountedRange.min, locale)}
                          {resolvedDiscountedRange.min !==
                            resolvedDiscountedRange.max &&
                            ` – ${formatPrice(resolvedDiscountedRange.max, locale)}`}
                        </span>
                      </>
                    ) : (
                      <span
                        className={`font-bold pc-elite-price ${isList ? "text-lg sm:text-base lg:text-lg" : "text-[12px] sm:text-base lg:text-lg"}`}
                      >
                        {formatPrice(resolvedRange.min, locale)}
                        {resolvedRange.min !== resolvedRange.max &&
                          ` – ${formatPrice(resolvedRange.max, locale)}`}
                      </span>
                    )}
                  </div>

                  <div className="pc-elite-cta">
                    {isAvailable ? (
                      <Link
                        href={`/${locale}/product/${slug}`}
                        className="block"
                      >
                        <Button size="sm" fullWidth>
                          {viewProduct}
                        </Button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full px-3 py-1.5 text-[10px] rounded-full bg-white/10 text-white/40 cursor-not-allowed"
                      >
                        {unavailable}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!isExact && !isRange && (
                <span className="text-xs pc-elite-muted">{unavailable}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
