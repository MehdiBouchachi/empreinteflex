"use client";

/**
 * MattressFinderSection — v3 · Dual-Face Edition
 * ─────────────────────────────────────────────────────────────────────────
 * KEY NEW FEATURE: Dual-Face Flip for Multi-Layer & Spring
 *
 * Multi-Layer and Spring mattresses have TWO usable faces:
 *   • طرية (Soft face)  — the comfort side
 *   • صلبة (Firm face)  — the support side
 *
 * These cards show a FLIP TOGGLE at the top:
 *   [🌙 Soft Face]  [⚡ Firm Face]
 *
 * Clicking flips the layer cross-section to show the opposite face's
 * layer stack — animated with an opacity+translateY transition.
 * The firmness dots, tagline, and sleep profile all update too.
 * A small "2-in-1" badge appears on the card corner.
 *
 * Classic mattresses are single-face — no toggle, simpler layout.
 *
 * All other improvements:
 *  • No double FirmnessSpectrum render (fixed)
 *  • Category color system (amber/emerald/violet)
 *  • Full EN · FR · AR translations inline
 *  • RTL layout support
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════════════════
   CATEGORY COLOR SYSTEM
══════════════════════════════════════════════════════════════════════════ */
const CAT_COLORS = {
  classic: {
    accent: "var(--color-finder-classic-accent)",
    accentLight: "var(--color-finder-classic-surface)",
    accentMid: "var(--color-finder-classic-accent-mid)",
    border: "var(--color-finder-classic-border)",
    badgeBg: "var(--color-finder-classic-accent)",
    badgeText: "var(--color-surface-base)",
  },
  "multi-layer": {
    accent: "var(--color-finder-multi-accent)",
    accentLight: "var(--color-finder-multi-surface)",
    accentMid: "var(--color-finder-multi-accent-mid)",
    border: "var(--color-finder-multi-border)",
    badgeBg: "var(--color-finder-multi-accent)",
    badgeText: "var(--color-surface-base)",
  },
  spring: {
    accent: "var(--color-finder-spring-accent)",
    accentLight: "var(--color-finder-spring-surface)",
    accentMid: "var(--color-finder-spring-accent-mid)",
    border: "var(--color-finder-spring-border)",
    badgeBg: "var(--color-finder-spring-accent)",
    badgeText: "var(--color-surface-base)",
  },
  all: {
    accent: "var(--color-finder-all-accent)",
    accentLight: "var(--color-finder-all-surface)",
    accentMid: "var(--color-finder-all-accent-mid)",
    border: "var(--color-finder-all-border)",
    badgeBg: "var(--color-finder-all-accent)",
    badgeText: "var(--color-surface-base)",
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   INLINE TRANSLATIONS — EN · FR · AR
══════════════════════════════════════════════════════════════════════════ */
const I18N = {
  en: {
    eyebrow: "Find your perfect sleep",
    heading: "Which mattress is right for you?",
    showing: "Showing",
    comfort: "comfort",
    products: "products",
    product: "product",
    bestMatch: "Best Match",
    dualFace: "2-in-1",
    softFace: "Soft Face",
    firmFace: "Firm Face",
    forLabel: "For",
    priceRange: "Price range",
    viewLayers: "View layers ↓",
    hideLayers: "Hide layers ↑",
    shopThis: "Shop This Mattress →",
    viewDetails: "View Details",
    notSure: "Not sure which to choose?",
    advisorDesc:
      "Our sleep advisors are available to help you find the perfect match.",
    talkAdvisor: "Talk to a Sleep Advisor",
    noProducts: "No products in this range yet.",
    all: "All Ranges",
    classic: "Classic",
    multiLayer: "Multi-Layer",
    spring: "Spring",
    firmness: "Firmness",
    specs: {
      Layers: "Layers",
      Material: "Material",
      Height: "Height",
      Warranty: "Warranty",
    },
    zones: [
      { label: "Cloud", desc: "Ultra-soft, like floating" },
      { label: "Plush", desc: "Soft, cradling comfort" },
      { label: "Balanced", desc: "Support + softness" },
      { label: "Structured", desc: "Firm with gentle give" },
      { label: "Firm", desc: "Maximum support" },
    ],
  },
  fr: {
    eyebrow: "Trouvez votre sommeil parfait",
    heading: "Quel matelas vous convient ?",
    showing: "Affichage",
    comfort: "confort",
    products: "produits",
    product: "produit",
    bestMatch: "Meilleur choix",
    dualFace: "2-en-1",
    softFace: "Face douce",
    firmFace: "Face ferme",
    forLabel: "Pour",
    priceRange: "Gamme de prix",
    viewLayers: "Voir les couches ↓",
    hideLayers: "Masquer ↑",
    shopThis: "Commander ce matelas →",
    viewDetails: "Voir les détails",
    notSure: "Pas sûr de votre choix ?",
    advisorDesc: "Nos conseillers sommeil sont disponibles pour vous aider.",
    talkAdvisor: "Parler à un conseiller",
    noProducts: "Aucun produit dans cette gamme.",
    all: "Toutes les gammes",
    classic: "Classique",
    multiLayer: "Multi-couches",
    spring: "Ressorts",
    firmness: "Fermeté",
    specs: {
      Layers: "Couches",
      Material: "Matière",
      Height: "Hauteur",
      Warranty: "Garantie",
    },
    zones: [
      { label: "Nuage", desc: "Ultra-doux, comme flotter" },
      { label: "Moelleux", desc: "Doux, confort enveloppant" },
      { label: "Équilibré", desc: "Soutien + douceur" },
      { label: "Structuré", desc: "Ferme avec un léger moelleux" },
      { label: "Ferme", desc: "Soutien maximum" },
    ],
  },
  ar: {
    eyebrow: "اعثر على نومك المثالي",
    heading: "أي مرتبة تناسبك؟",
    showing: "عرض",
    comfort: "راحة",
    products: "منتجات",
    product: "منتج",
    bestMatch: "الأنسب لك",
    dualFace: "وجهان",
    softFace: "الوجه الطري",
    firmFace: "الوجه الصلب",
    forLabel: "لـ",
    priceRange: "نطاق السعر",
    viewLayers: "عرض الطبقات ↓",
    hideLayers: "إخفاء الطبقات ↑",
    shopThis: "← اطلب هذه المرتبة",
    viewDetails: "عرض التفاصيل",
    notSure: "غير متأكد من اختيارك؟",
    advisorDesc:
      "مستشارو النوم متاحون لمساعدتك في العثور على المرتبة المثالية.",
    talkAdvisor: "تحدث مع مستشار نوم",
    noProducts: "لا توجد منتجات في هذا النطاق بعد.",
    all: "جميع الفئات",
    classic: "كلاسيكية",
    multiLayer: "متعددة الطبقات",
    spring: "زنبركية",
    firmness: "درجة الصلابة",
    specs: {
      Layers: "الطبقات",
      Material: "المادة",
      Height: "الارتفاع",
      Warranty: "الضمان",
    },
    zones: [
      { label: "سحابي", desc: "ناعم جداً، كالطفو" },
      { label: "وثير", desc: "ناعم، راحة محيطة" },
      { label: "متوازن", desc: "دعم + نعومة" },
      { label: "منظم", desc: "صلب مع مرونة خفيفة" },
      { label: "صلب", desc: "أقصى قدر من الدعم" },
    ],
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   STATIC PRODUCT DATA
   dualFace: true/false — drives the flip UI on Multi-Layer & Spring cards.
   faces.soft / faces.firm — each has its own layers, firmness, tagline,
   sleepProfile so the card updates completely when flipped.
══════════════════════════════════════════════════════════════════════════ */
const PRODUCTS = [
  /* ─── CLASSIC — single face ─────────────────────────────────────────── */
  {
    id: "classic-confort",
    name: "Confort Classic",
    category: "classic",
    dualFace: false,
    tagline: {
      en: "Everyday luxury, simplified.",
      fr: "Le luxe quotidien, simplifié.",
      ar: "فخامة يومية مبسّطة.",
    },
    firmness: 2,
    firmnessLabel: { en: "Soft", fr: "Doux", ar: "ناعم" },
    priceRange: "12 500 DA – 28 000 DA",
    sleepProfile: {
      en: "Side sleepers",
      fr: "Dormeurs sur le côté",
      ar: "نائمون على الجانب",
    },
    layers: [
      { label: "Quilted Cover", color: "var(--color-finder-layer-classic-1)", thickness: 14 },
      { label: "Memory Foam", color: "var(--color-finder-layer-classic-2)", thickness: 24 },
      { label: "Comfort Foam", color: "var(--color-finder-layer-classic-3)", thickness: 28 },
      { label: "Support Base", color: "var(--color-finder-layer-classic-4)", thickness: 18 },
    ],
    specs: [
      { key: "Layers", value: "4" },
      { key: "Material", value: "Memory Foam" },
      { key: "Height", value: "22 cm" },
      { key: "Warranty", value: "5 ans" },
    ],
    href: "/products/confort-classic",
  },
  {
    id: "classic-visco",
    name: "Matelas Visco",
    category: "classic",
    dualFace: false,
    tagline: {
      en: "Pressure relief that adapts to you.",
      fr: "Soulagement qui s'adapte à vous.",
      ar: "تخفيف الضغط يتكيف معك.",
    },
    firmness: 2,
    firmnessLabel: { en: "Soft–Medium", fr: "Doux–Moyen", ar: "ناعم–متوسط" },
    priceRange: "18 000 DA – 42 000 DA",
    sleepProfile: {
      en: "Back & side sleepers",
      fr: "Dos et côté",
      ar: "ظهر وجانب",
    },
    layers: [
      { label: "Cooling Cover", color: "var(--color-finder-layer-classic-5)", thickness: 12 },
      { label: "Visco Foam", color: "var(--color-finder-layer-classic-6)", thickness: 30 },
      { label: "Transition Foam", color: "var(--color-finder-classic-accent-mid)", thickness: 20 },
      { label: "HD Base", color: "var(--color-finder-layer-classic-7)", thickness: 20 },
    ],
    specs: [
      { key: "Layers", value: "4" },
      { key: "Material", value: "Visco-Elastic" },
      { key: "Height", value: "25 cm" },
      { key: "Warranty", value: "7 ans" },
    ],
    href: "/products/matelas-visco",
  },

  /* ─── MULTI-LAYER — dual face ────────────────────────────────────────── */
  {
    id: "multilayer-hr-d35",
    name: "Confort HR D35",
    category: "multi-layer",
    dualFace: true,
    priceRange: "14 000 DA – 36 000 DA",
    specs: [
      { key: "Layers", value: "5" },
      { key: "Material", value: "HR Foam" },
      { key: "Height", value: "24 cm" },
      { key: "Warranty", value: "7 ans" },
    ],
    href: "/products/confort-hr-d35",
    faces: {
      soft: {
        firmness: 2,
        firmnessLabel: { en: "Soft", fr: "Doux", ar: "طرية" },
        tagline: {
          en: "Sink in, wake refreshed.",
          fr: "Enveloppé, réveillé frais.",
          ar: "انغمس، استيقظ منتعشاً.",
        },
        sleepProfile: {
          en: "Side & back sleepers",
          fr: "Côté et dos",
          ar: "نائمون على الجانب والظهر",
        },
        layers: [
          { label: "Pillow Knit Top", color: "var(--color-finder-layer-multi-1)", thickness: 16 },
          { label: "Soft Memory Foam", color: "var(--color-finder-layer-multi-2)", thickness: 24 },
          { label: "Comfort Transition", color: "var(--color-finder-layer-multi-3)", thickness: 20 },
          { label: "HR Foam D35", color: "var(--color-finder-layer-multi-4)", thickness: 20 },
          { label: "Base", color: "var(--color-finder-layer-multi-5)", thickness: 10 },
        ],
      },
      firm: {
        firmness: 4,
        firmnessLabel: { en: "Firm", fr: "Ferme", ar: "صلبة" },
        tagline: {
          en: "Built to align. Designed to last.",
          fr: "Conçu pour aligner. Fait pour durer.",
          ar: "مبني للتوافق. مصمم ليدوم.",
        },
        sleepProfile: {
          en: "Back & stomach sleepers",
          fr: "Dos et ventre",
          ar: "نائمون على الظهر والبطن",
        },
        layers: [
          { label: "Firm Cover", color: "var(--color-finder-layer-multi-6)", thickness: 10 },
          { label: "Firm Comfort", color: "var(--color-finder-layer-multi-7)", thickness: 16 },
          { label: "HR Foam D35", color: "var(--color-finder-layer-multi-8)", thickness: 28 },
          { label: "Ortho Support", color: "var(--color-finder-layer-multi-9)", thickness: 22 },
          { label: "Dense Base", color: "var(--color-finder-layer-multi-5)", thickness: 14 },
        ],
      },
    },
  },
  {
    id: "multilayer-hr-d45",
    name: "Confort HR D45",
    category: "multi-layer",
    dualFace: true,
    priceRange: "22 000 DA – 55 000 DA",
    specs: [
      { key: "Layers", value: "5" },
      { key: "Material", value: "HR Foam D45" },
      { key: "Height", value: "26 cm" },
      { key: "Warranty", value: "10 ans" },
    ],
    href: "/products/confort-hr-d45",
    faces: {
      soft: {
        firmness: 2,
        firmnessLabel: { en: "Soft", fr: "Doux", ar: "طرية" },
        tagline: {
          en: "Cloud comfort, resilient core.",
          fr: "Confort nuage, cœur résilient.",
          ar: "راحة سحابية، قلب مرن.",
        },
        sleepProfile: {
          en: "Side sleepers",
          fr: "Côté",
          ar: "نائمون على الجانب",
        },
        layers: [
          { label: "Ultra-Soft Knit", color: "var(--color-finder-layer-multi-1)", thickness: 18 },
          { label: "Plush Memory", color: "var(--color-finder-layer-multi-2)", thickness: 22 },
          { label: "Transition Foam", color: "var(--color-finder-layer-multi-3)", thickness: 18 },
          { label: "HR Foam D45", color: "var(--color-finder-layer-multi-4)", thickness: 22 },
          { label: "Base", color: "var(--color-finder-layer-multi-5)", thickness: 10 },
        ],
      },
      firm: {
        firmness: 5,
        firmnessLabel: { en: "Very Firm", fr: "Très ferme", ar: "صلبة جداً" },
        tagline: {
          en: "Zero-compromise orthopaedic support.",
          fr: "Soutien orthopédique sans compromis.",
          ar: "دعم أورتوبيدي بلا تنازلات.",
        },
        sleepProfile: {
          en: "Back pain, heavy sleepers",
          fr: "Douleurs dorsales, dormeurs lourds",
          ar: "آلام الظهر، ثقيلو النوم",
        },
        layers: [
          { label: "Firm Knit Cover", color: "var(--color-finder-layer-multi-10)", thickness: 10 },
          { label: "Firm Comfort", color: "var(--color-finder-layer-multi-7)", thickness: 14 },
          { label: "HR Foam D45", color: "var(--color-finder-layer-multi-8)", thickness: 32 },
          { label: "Ortho Support", color: "var(--color-finder-layer-multi-9)", thickness: 24 },
          { label: "Dense Base", color: "var(--color-finder-layer-multi-5)", thickness: 10 },
        ],
      },
    },
  },

  /* ─── SPRING — dual face ─────────────────────────────────────────────── */
  {
    id: "spring-ressort",
    name: "Ressort Premium",
    category: "spring",
    dualFace: true,
    priceRange: "20 000 DA – 48 000 DA",
    specs: [
      { key: "Layers", value: "5" },
      { key: "Material", value: "Pocket Spring" },
      { key: "Height", value: "26 cm" },
      { key: "Warranty", value: "8 ans" },
    ],
    href: "/products/ressort-premium",
    faces: {
      soft: {
        firmness: 2,
        firmnessLabel: { en: "Soft", fr: "Doux", ar: "طرية" },
        tagline: {
          en: "Bounce meets cloud-soft comfort.",
          fr: "Ressort et confort nuage.",
          ar: "ارتداد مع راحة ناعمة كالسحاب.",
        },
        sleepProfile: {
          en: "Side sleepers, couples",
          fr: "Côté, couples",
          ar: "جانب، أزواج",
        },
        layers: [
          { label: "Pillow Top", color: "var(--color-finder-layer-spring-1)", thickness: 18 },
          { label: "Plush Foam", color: "var(--color-finder-layer-spring-2)", thickness: 18 },
          { label: "Pocket Springs", color: "var(--color-finder-layer-spring-3)", thickness: 28 },
          { label: "Insulation Pad", color: "var(--color-finder-layer-spring-4)", thickness: 10 },
          { label: "Base", color: "var(--color-finder-spring-accent)", thickness: 12 },
        ],
      },
      firm: {
        firmness: 4,
        firmnessLabel: { en: "Firm", fr: "Ferme", ar: "صلبة" },
        tagline: {
          en: "Spring resilience with firm support.",
          fr: "Résilience ressort avec soutien ferme.",
          ar: "مرونة زنبركية مع دعم صلب.",
        },
        sleepProfile: {
          en: "Back & stomach sleepers",
          fr: "Dos et ventre",
          ar: "ظهر وبطن",
        },
        layers: [
          { label: "Firm Cover", color: "var(--color-finder-layer-spring-5)", thickness: 10 },
          { label: "Firm Comfort", color: "var(--color-finder-layer-spring-6)", thickness: 14 },
          { label: "Bonnell Springs", color: "var(--color-finder-layer-spring-7)", thickness: 34 },
          { label: "Ortho Pad", color: "var(--color-finder-layer-spring-8)", thickness: 14 },
          { label: "Rigid Base", color: "var(--color-finder-spring-accent)", thickness: 14 },
        ],
      },
    },
  },
  {
    id: "spring-orthopedic",
    name: "Ortho Spring",
    category: "spring",
    dualFace: true,
    priceRange: "28 000 DA – 65 000 DA",
    specs: [
      { key: "Layers", value: "5" },
      { key: "Material", value: "Bonnell Spring" },
      { key: "Height", value: "28 cm" },
      { key: "Warranty", value: "10 ans" },
    ],
    href: "/products/ortho-spring",
    faces: {
      soft: {
        firmness: 2,
        firmnessLabel: { en: "Soft", fr: "Doux", ar: "طرية" },
        tagline: {
          en: "Gentle support for sensitive bodies.",
          fr: "Soutien doux pour les corps sensibles.",
          ar: "دعم لطيف للأجسام الحساسة.",
        },
        sleepProfile: {
          en: "Side sleepers, elderly",
          fr: "Côté, personnes âgées",
          ar: "جانب، كبار السن",
        },
        layers: [
          { label: "Velvet Pillow Top", color: "var(--color-finder-layer-spring-1)", thickness: 20 },
          { label: "Latex Soft", color: "var(--color-finder-layer-spring-2)", thickness: 20 },
          { label: "Bonnell Springs", color: "var(--color-finder-layer-spring-3)", thickness: 28 },
          { label: "Cushion Pad", color: "var(--color-finder-layer-spring-4)", thickness: 12 },
          { label: "Base", color: "var(--color-finder-spring-accent)", thickness: 10 },
        ],
      },
      firm: {
        firmness: 5,
        firmnessLabel: { en: "Very Firm", fr: "Très ferme", ar: "صلبة جداً" },
        tagline: {
          en: "Structured support for pain-free mornings.",
          fr: "Soutien structuré pour des matins sans douleur.",
          ar: "دعم منظم لصباح خالٍ من الألم.",
        },
        sleepProfile: {
          en: "Back pain, stomach sleepers",
          fr: "Douleurs dorsales, ventre",
          ar: "آلام الظهر، نوم على البطن",
        },
        layers: [
          { label: "Firm Cover", color: "var(--color-finder-layer-spring-5)", thickness: 10 },
          { label: "Latex Firm", color: "var(--color-finder-layer-spring-6)", thickness: 18 },
          { label: "Bonnell Springs", color: "var(--color-finder-layer-spring-7)", thickness: 34 },
          { label: "Ortho Pad", color: "var(--color-finder-layer-spring-8)", thickness: 14 },
          { label: "Rigid Base", color: "var(--color-finder-spring-accent)", thickness: 14 },
        ],
      },
    },
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
══════════════════════════════════════════════════════════════════════════ */
const EX = [0.16, 1, 0.3, 1];
const vFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EX } },
};
const vStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const vCardEntry = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EX },
  },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.25, ease: EX } },
};

/* ══════════════════════════════════════════════════════════════════════════
   FIRMNESS MATCH
══════════════════════════════════════════════════════════════════════════ */
function firmnessMatch(pFirmness, selected) {
  const d = Math.abs(pFirmness - selected);
  return d === 0 ? 1 : d === 1 ? 0.72 : d === 2 ? 0.42 : 0.15;
}

function productFirmness(product, face) {
  if (!product.dualFace) return product.firmness;
  return product.faces[face].firmness;
}

/* ══════════════════════════════════════════════════════════════════════════
   LAYER CROSS-SECTION
══════════════════════════════════════════════════════════════════════════ */
function LayerCrossSection({ layers, dimmed }) {
  const total = layers.reduce((s, l) => s + l.thickness, 0);
  return (
    <div className="w-full rounded-md overflow-hidden" style={{ height: 88 }}>
      {layers.map((layer, i) => (
        <div
          key={i}
          title={layer.label}
          style={{
            height: `${(layer.thickness / total) * 88}px`,
            backgroundColor: layer.color,
            opacity: dimmed ? 0.4 : 1,
            transition: "opacity 0.4s ease, height 0.5s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FACE TOGGLE — the signature UI for dual-face products
══════════════════════════════════════════════════════════════════════════ */
function FaceToggle({ face, onChange, cc, t, isRTL }) {
  return (
    <div
      className={`flex rounded-md overflow-hidden border text-[11px] font-semibold
        ${isRTL ? "flex-row-reverse" : ""}`}
      style={{ borderColor: cc.border + "55" }}
    >
      {/* Soft face */}
      <button
        onClick={() => onChange("soft")}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3
          transition-all duration-250 focus-visible:outline-none"
        style={
          face === "soft"
            ? { backgroundColor: cc.accentMid, color: "var(--color-surface-base)" }
            : { backgroundColor: cc.accentLight, color: cc.accent }
        }
      >
        {/* Moon icon — soft */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        {t.softFace}
      </button>

      {/* Divider */}
      <span style={{ width: 1, backgroundColor: cc.border + "44" }} />

      {/* Firm face */}
      <button
        onClick={() => onChange("firm")}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3
          transition-all duration-250 focus-visible:outline-none"
        style={
          face === "firm"
            ? { backgroundColor: cc.accentMid, color: "var(--color-surface-base)" }
            : { backgroundColor: cc.accentLight, color: cc.accent }
        }
      >
        {/* Sun icon — firm */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        {t.firmFace}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FIRMNESS DOTS
══════════════════════════════════════════════════════════════════════════ */
function FirmnessDots({ value, color }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="block rounded-full transition-all duration-300"
          style={{
            width: i < value ? 9 : 6,
            height: i < value ? 9 : 6,
            backgroundColor: i < value ? color : "var(--color-brand-border)",
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PRODUCT CARD
══════════════════════════════════════════════════════════════════════════ */
function ProductCard({ product, isBestMatch, matchScore, t, isRTL, locale }) {
  const [face, setFace] = useState("soft");
  const [showLayers, setLayers] = useState(false);
  const dimmed = matchScore < 0.4;
  const cc = CAT_COLORS[product.category];

  /* Resolve face data */
  const faceData = product.dualFace ? product.faces[face] : null;
  const layers = product.dualFace ? faceData.layers : product.layers;
  const firmness = product.dualFace ? faceData.firmness : product.firmness;
  const fLabel = product.dualFace
    ? (faceData.firmnessLabel[locale] ?? faceData.firmnessLabel.en)
    : (product.firmnessLabel[locale] ?? product.firmnessLabel.en);
  const tagline = product.dualFace
    ? (faceData.tagline[locale] ?? faceData.tagline.en)
    : (product.tagline[locale] ?? product.tagline.en);
  const profile = product.dualFace
    ? (faceData.sleepProfile[locale] ?? faceData.sleepProfile.en)
    : (product.sleepProfile[locale] ?? product.sleepProfile.en);

  const catLabel =
    product.category === "multi-layer"
      ? t.multiLayer
      : product.category === "spring"
        ? t.spring
        : t.classic;

  return (
    <motion.div
      layout
      variants={vCardEntry}
      dir={isRTL ? "rtl" : "ltr"}
      className="relative flex flex-col bg-white rounded-md overflow-hidden
        transition-all duration-400 border-l-4"
      style={{
        borderLeftColor: cc.border,
        boxShadow: isBestMatch
          ? `0 8px 32px ${cc.accent}28`
          : dimmed
            ? "none"
            : "0 2px 14px rgba(var(--rgb-black),0.06)",
        opacity: dimmed ? 0.38 : 1,
        outline: isBestMatch ? `1.5px solid ${cc.border}88` : "none",
      }}
    >
      {/* ── TOP BADGES ── */}
      <div
        className={`absolute top-3 z-10 flex items-center gap-2
        ${isRTL ? "right-3 flex-row-reverse" : "left-3"}`}
      >
        {/* Category pill */}
        <span
          className="text-[9px] font-bold uppercase tracking-[0.38em]
          px-2 py-0.5 rounded-full"
          style={{ backgroundColor: cc.accentLight, color: cc.accent }}
        >
          {catLabel}
        </span>

        {/* 2-in-1 badge */}
        {product.dualFace && (
          <span
            className="text-[9px] font-bold uppercase tracking-[0.35em]
            px-2 py-0.5 rounded-full border"
            style={{
              borderColor: cc.border,
              color: cc.accentMid,
              backgroundColor: "var(--color-surface-base)",
            }}
          >
            {t.dualFace}
          </span>
        )}
      </div>

      {/* Best match badge */}
      {isBestMatch && (
        <div
          className={`absolute top-3 z-10
          text-[9px] font-bold uppercase tracking-[0.42em]
          px-2.5 py-1 rounded-full
          ${isRTL ? "left-3" : "right-3"}`}
          style={{ backgroundColor: cc.badgeBg, color: cc.badgeText }}
        >
          {t.bestMatch}
        </div>
      )}

      {/* ── FACE TOGGLE (dual-face only) ── */}
      {product.dualFace && (
        <div className="px-4 pt-10 pb-2">
          <FaceToggle
            face={face}
            onChange={setFace}
            cc={cc}
            t={t}
            isRTL={isRTL}
          />
        </div>
      )}

      {/* ── LAYER CROSS-SECTION ── */}
      <div className={`px-4 ${product.dualFace ? "pt-2" : "pt-10"} pb-3`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${product.id}-${face}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: EX }}
          >
            <LayerCrossSection layers={layers} dimmed={dimmed} />
          </motion.div>
        </AnimatePresence>

        {/* Face label strip under cross-section (dual-face only) */}
        {product.dualFace && (
          <div
            className={`mt-2 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.38em]"
              style={{ color: cc.accentMid }}
            >
              {face === "soft" ? t.softFace : t.firmFace}
            </span>
            <span
              className="h-px flex-1"
              style={{ backgroundColor: cc.border + "44" }}
            />
            <span className="text-[10px] text-slate-400 italic">{tagline}</span>
          </div>
        )}
      </div>

      {/* ── LAYER LEGEND ── */}
      <AnimatePresence>
        {showLayers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EX }}
            className="overflow-hidden px-4"
          >
            <div className="py-2 space-y-1.5 border-t border-slate-100">
              {layers.map((l, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="text-[11px] text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CARD BODY ── */}
      <div
        className={`flex flex-col flex-1 px-4 pb-5 pt-2 ${isRTL ? "text-right" : "text-left"}`}
      >
        {/* Name */}
        <h3 className="font-display font-semibold text-blue-950 text-[1rem] leading-snug mb-0.5">
          {product.name}
        </h3>

        {/* Tagline — only for single-face (dual-face tagline is in the strip above) */}
        {!product.dualFace && (
          <p className="text-[11px] text-slate-400 italic mb-3 leading-relaxed">
            {tagline}
          </p>
        )}
        {product.dualFace && <div className="mb-2" />}

        {/* Firmness dots */}
        <div
          className={`flex items-center gap-2 mb-2.5 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <FirmnessDots value={firmness} color={cc.accentMid} />
          <span className="text-[11px] text-slate-500 font-medium">
            {fLabel}
          </span>
        </div>

        {/* Sleep profile */}
        <div
          className={`flex items-center gap-1.5 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.38em] text-slate-400">
            {t.forLabel}
          </span>
          <span className="text-[11px] text-slate-600 font-medium">
            {profile}
          </span>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
          {product.specs.map(({ key, value }) => (
            <div key={key} className="flex flex-col">
              <span className="text-[9.5px] font-medium uppercase tracking-[0.38em] text-slate-400 mb-0.5">
                {t.specs[key] ?? key}
              </span>
              <span className="text-[12px] font-bold text-blue-950">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="mb-3">
          <span className="text-[9.5px] font-medium uppercase tracking-[0.38em] text-slate-400 block mb-0.5">
            {t.priceRange}
          </span>
          <span className="text-sm font-bold text-blue-950">
            {product.priceRange}
          </span>
        </div>

        {/* Layer toggle */}
        <button
          onClick={() => setLayers((p) => !p)}
          className="text-[11px] font-medium mb-3 text-left focus-visible:outline-none
            transition-colors duration-200"
          style={{ color: cc.accentMid }}
        >
          {showLayers ? t.hideLayers : t.viewLayers}
        </button>

        {/* CTA */}
        <div className="mt-auto">
          <Link
            href={product.href}
            className="block w-full text-center rounded-md py-2.5 text-[13px] font-semibold
              transition-all duration-250 focus-visible:outline-none"
            style={
              isBestMatch
                ? { backgroundColor: cc.badgeBg, color: "var(--color-surface-base)" }
                : { backgroundColor: cc.accentLight, color: cc.accent }
            }
          >
            {isBestMatch ? t.shopThis : t.viewDetails}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FIRMNESS SPECTRUM
   Two separate components — parent call-sites control show/hide via
   `hidden lg:block` / `lg:hidden` wrappers. No internal breakpoint guards.
   This eliminates the double-render bug permanently.
══════════════════════════════════════════════════════════════════════════ */

/** Desktop: vertical sidebar list */
function FirmnessSpectrumDesktop({ selected, onChange, t }) {
  return (
    <div className="flex flex-col w-[148px] flex-shrink-0 select-none">
      <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-blue-400 mb-3">
        {t.firmness}
      </p>
      <div className="flex flex-col rounded-md overflow-hidden border border-blue-950/10 bg-white shadow-sm">
        {t.zones.map((zone, i) => {
          const on = selected === i + 1;
          return (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`group relative text-left px-3.5 py-3 transition-all duration-200
                focus-visible:outline-none
                ${on ? "bg-blue-950" : "bg-white hover:bg-blue-50"}
                ${i < t.zones.length - 1 ? "border-b border-blue-950/[0.07]" : ""}`}
            >
              <span
                className={`absolute left-0 inset-y-0 w-[3px] rounded-r transition-all duration-200
                ${on ? "bg-blue-300" : "bg-transparent group-hover:bg-blue-100"}`}
              />
              <span
                className={`block text-[12px] font-semibold mb-0.5
                ${on ? "text-white" : "text-blue-950"}`}
              >
                {zone.label}
              </span>
              <span
                className={`block text-[10px] leading-tight
                ${on ? "text-blue-300" : "text-slate-400"}`}
              >
                {zone.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Mobile: horizontal pill row */
function FirmnessSpectrumMobile({ selected, onChange, t }) {
  return (
    <div className="mb-5 select-none">
      <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-blue-400 mb-2">
        {t.firmness}
      </p>
      <div className="flex rounded-md overflow-hidden border border-blue-950/10 bg-white shadow-sm">
        {t.zones.map((zone, i) => {
          const on = selected === i + 1;
          return (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`flex-1 py-2.5 text-center text-[10px] font-semibold
                transition-all duration-200 focus-visible:outline-none
                ${on ? "bg-blue-950 text-white" : "bg-white text-blue-950/55 hover:bg-blue-50"}
                ${i < t.zones.length - 1 ? "border-r border-blue-950/[0.07]" : ""}`}
            >
              {zone.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CATEGORY TABS
══════════════════════════════════════════════════════════════════════════ */
function CategoryTabs({ active, onChange, t }) {
  const cats = [
    { key: "all", label: t.all },
    { key: "classic", label: t.classic },
    { key: "multi-layer", label: t.multiLayer },
    { key: "spring", label: t.spring },
  ];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {cats.map(({ key, label }) => {
        const on = active === key;
        const cc = CAT_COLORS[key];
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border
              transition-all duration-200 focus-visible:outline-none"
            style={
              on
                ? {
                    backgroundColor: cc.accent,
                    color: "var(--color-surface-base)",
                    borderColor: cc.accent,
                  }
                : {
                    backgroundColor: "var(--color-surface-base)",
                    color: cc.accent,
                    borderColor: cc.border + "55",
                  }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN SECTION
══════════════════════════════════════════════════════════════════════════ */
export default function MattressFinderSection({ locale = "en" }) {
  const [firmness, setFirmness] = useState(3);
  const [category, setCategory] = useState("all");
  const reduced = useReducedMotion();

  const t = { ...(I18N[locale] ?? I18N.en), _locale: locale };
  const isRTL = locale === "ar";

  /* Filter */
  const filtered = PRODUCTS.filter(
    (p) => category === "all" || p.category === category,
  );

  /* Sort by best face match */
  const sorted = [...filtered].sort((a, b) => {
    const sa = Math.max(
      firmnessMatch(productFirmness(a, "soft"), firmness),
      a.dualFace ? firmnessMatch(productFirmness(a, "firm"), firmness) : 0,
    );
    const sb = Math.max(
      firmnessMatch(productFirmness(b, "soft"), firmness),
      b.dualFace ? firmnessMatch(productFirmness(b, "firm"), firmness) : 0,
    );
    return sb - sa;
  });

  /* Best match = top card where at least one face is a perfect match */
  const topScore = sorted[0]
    ? Math.max(
        firmnessMatch(productFirmness(sorted[0], "soft"), firmness),
        sorted[0].dualFace
          ? firmnessMatch(productFirmness(sorted[0], "firm"), firmness)
          : 0,
      )
    : 0;
  const bestMatchId = topScore === 1 ? sorted[0]?.id : null;
  const selectedZone = t.zones[firmness - 1];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden bg-slate-50 py-12 sm:py-16 lg:py-20"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
          radial-gradient(ellipse 55% 40% at 100% 0%,   rgba(var(--rgb-brand-border),0.35) 0%, transparent 70%),
          radial-gradient(ellipse 45% 45% at   0% 100%, rgba(var(--rgb-success),0.18) 0%, transparent 70%)
        `,
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        {/* HEADER */}
        <motion.div
          variants={vFadeUp}
          initial={reduced ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-8 sm:mb-10"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.45em] text-blue-500 mb-2.5">
            {t.eyebrow}
          </p>
          <div
            className={`flex flex-col gap-4 ${
              isRTL ? "sm:flex-row-reverse" : "sm:flex-row"
            } sm:items-end sm:justify-between`}
          >
            <h2
              className={`font-display font-semibold text-blue-950
              text-xl sm:text-2xl lg:text-3xl tracking-tight leading-[1.15] max-w-md
              ${isRTL ? "text-right" : ""}`}
            >
              {t.heading}
            </h2>
            <div className="flex-shrink-0">
              <CategoryTabs active={category} onChange={setCategory} t={t} />
            </div>
          </div>
        </motion.div>

        {/* MAIN LAYOUT */}
        <div
          className={`flex gap-8 lg:gap-10 items-start ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {/* Sticky firmness sidebar — desktop only */}
          <div className="hidden lg:block sticky top-8 self-start">
            <FirmnessSpectrumDesktop
              selected={firmness}
              onChange={setFirmness}
              t={t}
            />
          </div>

          {/* Cards */}
          <div className="flex-1 min-w-0">
            {/* Mobile firmness bar — mobile only */}
            <div className="lg:hidden">
              <FirmnessSpectrumMobile
                selected={firmness}
                onChange={setFirmness}
                t={t}
              />
            </div>

            {/* Context row */}
            <motion.div
              key={`${firmness}-${category}`}
              initial={reduced ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className={`flex items-center gap-3 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`text-sm text-slate-500 ${isRTL ? "text-right" : ""}`}
              >
                {t.showing}{" "}
                <strong className="text-blue-950">{selectedZone?.label}</strong>{" "}
                {t.comfort}
                {category !== "all" && (
                  <>
                    {" "}
                    ·{" "}
                    <strong className="text-blue-950">
                      {t[category === "multi-layer" ? "multiLayer" : category]}
                    </strong>
                  </>
                )}
              </span>
              <span className="h-px flex-1 bg-blue-950/[0.07]" />
              <span className="text-xs text-slate-400 flex-shrink-0">
                {sorted.length} {sorted.length !== 1 ? t.products : t.product}
              </span>
            </motion.div>

            {sorted.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-400">{t.noProducts}</p>
              </div>
            ) : (
              <motion.div
                layout
                variants={vStagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {sorted.map((product) => {
                    const score = Math.max(
                      firmnessMatch(productFirmness(product, "soft"), firmness),
                      product.dualFace
                        ? firmnessMatch(
                            productFirmness(product, "firm"),
                            firmness,
                          )
                        : 0,
                    );
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isBestMatch={product.id === bestMatchId}
                        matchScore={score}
                        t={t}
                        isRTL={isRTL}
                        locale={locale}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <motion.div
          variants={vFadeUp}
          initial={reduced ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className={`mt-10 sm:mt-12 pt-7 border-t border-blue-950/[0.07]
            flex flex-col gap-4
            ${
              isRTL
                ? "sm:flex-row-reverse sm:items-center sm:justify-between"
                : "sm:flex-row sm:items-center sm:justify-between"
            }`}
        >
          <div className={isRTL ? "text-right" : ""}>
            <p className="text-sm font-semibold text-blue-950 mb-0.5">
              {t.notSure}
            </p>
            <p className="text-sm text-slate-500">{t.advisorDesc}</p>
          </div>
          <Link
            href={`${locale}/contact`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5
              rounded-md text-sm font-medium bg-white border border-blue-950/[0.1]
              text-blue-950 hover:bg-blue-950 hover:text-white hover:border-blue-950
              transition-all duration-250 focus-visible:outline-none"
          >
            {t.talkAdvisor}
            <span aria-hidden="true">{isRTL ? "←" : "→"}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
