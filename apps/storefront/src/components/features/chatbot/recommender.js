/* ────────────────────────────────────────────────────────────────────────
   Chatbot recommendation engine — PURE, no React, no "use client".

   Grounding guarantee: this module only ever reasons over products that are
   passed into it (the live Supabase catalog, or the static constants
   fallback). It never invents products, prices, or specs.

   Shared by:
     • app/api/chatbot/catalog/route.js  (server — normalizes live catalog)
     • useChatbot.js                      (client — normalizes static fallback
                                           + runs recommend())
──────────────────────────────────────────────────────────────────────────── */

export const MATTRESS_MATERIALS = ["foam", "memory", "spring"];

/* ── Material family, derived from the (reliable) category value ────────── */
export function deriveMaterial(category) {
  switch ((category || "").toLowerCase()) {
    case "classic":
      return "foam";
    case "multi-layer":
      return "memory";
    case "spring":
      return "spring";
    case "sur-matelas":
      return "topper";
    case "oreiller":
      return "pillow";
    default:
      return "foam";
  }
}

/* ── Firmness on a 1–10 scale (higher = firmer) ──────────────────────────
   Prefer a real numeric value from the product; otherwise parse the spec
   text; otherwise fall back to a category/subcategory heuristic that mirrors
   the real catalog (classic ≈ firm, visco ≈ soft-medium, etc.).            */
const FIRMNESS_BY_CATEGORY = { classic: 8, "multi-layer": 7, spring: 7 };
const FIRMNESS_BY_SUBCATEGORY = {
  confort: 7,
  visco: 6,
  "visco-plus": 7,
  "spring-confort": 7,
  "spring-premium": 8,
  "spring-prestige": 7,
};

export function deriveFirmness(raw, category, subcategory) {
  if (typeof raw === "number" && raw >= 1 && raw <= 10) return raw;

  if (typeof raw === "string") {
    const digits = raw.match(/\d+/);
    if (digits) {
      const n = parseInt(digits[0], 10);
      if (n >= 1 && n <= 10) return n;
    }
    const t = raw.toLowerCase();
    if (/(très ferme|very firm|extra firm|صلب جدا)/.test(t)) return 9;
    if (/(medium-?firm|mi-?ferme|équilibr|متوازن)/.test(t)) return 7;
    if (/(ferme|firm|صلب)/.test(t)) return 8;
    if (/(medium|moyen|متوسط)/.test(t)) return 6;
    if (/(moelleux|soft|doux|ناعم|وثير)/.test(t)) return 4;
  }

  const sub = FIRMNESS_BY_SUBCATEGORY[(subcategory || "").toLowerCase()];
  if (sub) return sub;
  return FIRMNESS_BY_CATEGORY[(category || "").toLowerCase()] ?? 6;
}

export function firmnessWord(n) {
  if (n <= 5) return "soft";
  if (n <= 7) return "medium";
  return "firm";
}

/* Canonicalize a size label so the two catalog formats — "90 x 190" (static
   constants) and "90x190" (live Supabase dimensions) — compare equal. */
export function normalizeSize(size) {
  return String(size || "")
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/\s+/g, "");
}

export function applyDiscount(price, discountPct) {
  const v = Number(price) || 0;
  const pct = Number(discountPct) || 0;
  if (pct <= 0) return v;
  return Math.round(v * (1 - pct / 100));
}

function collectOptionPrices(product) {
  const prices = [];
  const dims = product?.details?.dimensions || [];
  for (const d of dims) {
    for (const o of d.options || []) {
      const p = Number(o.price);
      if (p > 0) prices.push(p);
    }
  }
  if (!prices.length && product?.basePrice) {
    const p = Number(product.basePrice);
    if (p > 0) prices.push(p);
  }
  return prices;
}

function parseWarrantyYears(specs = []) {
  for (const s of specs) {
    const label = (s?.label || "").toLowerCase();
    if (/warranty|garantie|ضمان/.test(label)) {
      const m = String(s?.value || "").match(/\d+/);
      if (m) return parseInt(m[0], 10);
    }
  }
  return null;
}

/* ── Normalize a raw product (from either data source) into the compact
     shape the recommender + UI consume. ─────────────────────────────────── */
export function normalizeProduct(product) {
  if (!product || !product.slug) return null;

  const category = product.category ?? null;
  const subcategory = product.subcategory ?? null;
  const discount = Number(product.discount) || 0;
  const material = deriveMaterial(category);

  const optionPrices = collectOptionPrices(product);
  const rawMin =
    Number(product.minPrice) > 0
      ? Number(product.minPrice)
      : optionPrices.length
        ? Math.min(...optionPrices)
        : 0;
  const rawMax =
    Number(product?.priceRange?.max) > 0
      ? Number(product.priceRange.max)
      : optionPrices.length
        ? Math.max(...optionPrices)
        : rawMin;

  /* size → cheapest (discounted) price for that size, keyed by canonical size */
  const sizePrices = {};
  for (const d of product?.details?.dimensions || []) {
    const opts = (d.options || []).map((o) => Number(o.price)).filter((p) => p > 0);
    if (opts.length && d.size) sizePrices[normalizeSize(d.size)] = applyDiscount(Math.min(...opts), discount);
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category,
    subcategory,
    categoryTranslations: product.categoryTranslations || null,
    material,
    featured: Boolean(product.featured),
    available: product.available !== false,
    discount,
    image: product.images?.[0] || null,
    firmness: deriveFirmness(product?.details?.firmness, category, subcategory),
    thickness: product?.details?.thickness ?? null,
    warranty: parseWarrantyYears(product?.details?.technicalSpecs),
    sizes: Object.keys(sizePrices),
    minPrice: rawMin,
    maxPrice: rawMax,
    effectiveMinPrice: applyDiscount(rawMin, discount),
    sizePrices,
  };
}

/* ── Budget code → ceiling in DZD ────────────────────────────────────────── */
export function budgetCeiling(code) {
  switch (code) {
    case "lt30":
      return 30000;
    case "30_50":
      return 50000;
    case "50_70":
      return 70000;
    default: // gt70 | flex | undefined
      return Infinity;
  }
}

const FIRMNESS_TARGET = { soft: 4.5, balanced: 6.5, firm: 8.5 };
const POSITION_TARGET = { back: 7, side: 5.5, stomach: 8, mixed: 6.5 };
const DURABLE_SLUGS = ["visco-plus", "ressort-premium", "ressort-prestige"];

/* Score one (normalized) product against the collected quiz answers.
   Returns { score, reasons[], entry, overBudget }.                          */
export function scoreProduct(p, a = {}) {
  let score = 0;
  const reasons = [];

  /* Firmness — combine explicit preference with sleeping position */
  let target =
    a.firmness && a.firmness !== "notsure"
      ? FIRMNESS_TARGET[a.firmness]
      : (POSITION_TARGET[a.position] ?? 6.5);
  if (a.firmness && a.firmness !== "notsure") {
    target += { side: -0.5, stomach: 0.5, back: 0.2, mixed: 0 }[a.position] || 0;
  }
  const fdiff = Math.abs(p.firmness - target);
  score += Math.max(0, 3 - fdiff) * 1.5;
  if (fdiff <= 1.2) reasons.push("firmness");

  /* Material preference — strong steer, not a hard filter */
  if (a.material && a.material !== "any") {
    if (p.material === a.material) {
      score += 4;
      reasons.push("material");
    } else {
      score -= 3;
    }
  }

  /* Priority need */
  switch (a.needs) {
    case "back":
      if (p.material === "memory") {
        score += 3;
        reasons.push("backpain");
      } else if (p.firmness >= 7) {
        score += 1;
      }
      if (p.firmness >= 6 && p.firmness <= 7.5) score += 0.5;
      break;
    case "hot":
      if (p.material === "spring") {
        score += 3;
        reasons.push("cool");
      } else if (p.material === "memory") {
        score -= 1;
      }
      break;
    case "motion":
      if (p.material === "memory") {
        score += 3;
        reasons.push("motion");
      } else if (p.material === "spring") {
        score -= 0.5;
      }
      break;
    case "durable":
      if (DURABLE_SLUGS.includes(p.slug) || p.category === "classic") {
        score += 2.5;
        reasons.push("durable");
      }
      break;
    default:
      break;
  }

  /* Audience */
  switch (a.audience) {
    case "couple":
      if (p.material === "memory") {
        score += 1;
        if (!reasons.includes("motion")) reasons.push("coupleMotion");
      }
      if (p.sizes.some((s) => /160|180/.test(s))) score += 0.5;
      break;
    case "child":
      if (p.material === "foam") {
        score += 1;
        reasons.push("kids");
      }
      if (p.firmness >= 7) score += 0.5;
      score += Math.max(0, (30000 - p.effectiveMinPrice) / 30000);
      break;
    case "guest":
      score += Math.max(0, (35000 - p.effectiveMinPrice) / 25000);
      if (p.effectiveMinPrice <= 35000 && !reasons.includes("kids")) reasons.push("value");
      break;
    default:
      break;
  }

  /* Budget */
  const sizeKey = a.size && a.size !== "any" ? normalizeSize(a.size) : null;
  const ceil = budgetCeiling(a.budget);
  const entry = sizeKey && p.sizePrices[sizeKey] ? p.sizePrices[sizeKey] : p.effectiveMinPrice;
  const overBudget = entry > ceil;
  if (!overBudget) {
    score += 1.5;
    if (Number.isFinite(ceil)) reasons.push("budget");
  } else {
    score -= 6;
  }
  /* Premium budget: reward the premium band, discourage bargain models that
     would look out of place as a "over 70,000 DA" recommendation. */
  if (a.budget === "gt70") {
    if (entry >= 60000) score += 1.5;
    else if (entry < 40000) score -= 2.5;
  }

  /* Size availability */
  if (sizeKey && !p.sizes.includes(sizeKey)) score -= 2;

  /* Featured tiebreak */
  if (p.featured) score += 0.3;

  return { score, reasons, entry, overBudget };
}

/* Rank the catalog and return the top matches (mattresses only). */
export function recommend(catalog, answers = {}, { limit = 2 } = {}) {
  const mattresses = (catalog || []).filter(
    (p) => MATTRESS_MATERIALS.includes(p.material) && p.available,
  );
  if (!mattresses.length) return { items: [], relaxedBudget: false };

  const scored = mattresses.map((p) => ({ product: p, ...scoreProduct(p, answers) }));
  const inBudget = scored.filter((s) => !s.overBudget);
  const pool = inBudget.length ? inBudget : scored;

  pool.sort((x, y) => y.score - x.score || x.entry - y.entry);

  const items = pool.slice(0, limit).map((s) => {
    const reasons = s.reasons.length ? s.reasons : ["popular"];
    return { product: s.product, reasons: [...new Set(reasons)].slice(0, 3), entry: s.entry };
  });

  const relaxedBudget = inBudget.length === 0 && Number.isFinite(budgetCeiling(answers.budget));
  return { items, relaxedBudget };
}
