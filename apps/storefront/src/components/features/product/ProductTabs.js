"use client";

/**
 * ProductTabs.js
 * ─────────────────────────────────────────────────────────────────────────
 * Tabs toggle between Product Story and Technical Specs.
 *
 * Design:
 * - Clean underline tab design (no heavy containers)
 * - Only active tab has underline in brand blue
 * - Smooth transitions between tabs
 * - Full content display (no animation overload)
 *
 * Preserves all existing content from ProductStorySection and
 * TechnicalSpecsSection — no logic changes.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { useProduct } from "./ProductContext";
import { productStoryContent } from "./productStoryContent";

/* ── UI strings ──────────────────────────────────────────────────────── */
const UI = {
  tabs: {
    story: {
      en: "Product Story",
      fr: "Histoire du produit",
      ar: "قصة المنتج",
    },
    specs: {
      en: "Specifications",
      fr: "Caractéristiques",
      ar: "المواصفات",
    },
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

/* ── locale resolver ─────────────────────────────────────────────────── */
function loc(field, locale) {
  if (!field) return "";
  return field[locale] ?? field.en ?? "";
}

/* ── Tab header component ────────────────────────────────────────────── */
function TabButton({ isActive, onClick, label, isRTL }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative py-3 px-1 text-sm sm:text-base font-medium
        transition-colors duration-200
        ${isRTL ? "ml-6 sm:ml-8" : "mr-6 sm:mr-8"}
        ${isActive ? "text-blue-900" : "text-slate-600 hover:text-slate-900"}
      `}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-900 rounded-t-sm" />
      )}
    </button>
  );
}

/* ── Eyebrow component ───────────────────────────────────────────────── */
function Eyebrow({ label, isRTL }) {
  return (
    <div
      className={`flex items-center gap-3 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}
    >
      <div className="h-0.5 w-8 shrink-0 bg-blue-900" />
      <p className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* ── Story Part A: Philosophy + Engineering ──────────────────────────── */
function StoryPhilosophyPart({ story, product, locale, isRTL }) {
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
        {/* Label column */}
        <div
          className={`
            lg:w-55 xl:w-65 shrink-0
            lg:pr-10 xl:pr-12
            ${isRTL ? "lg:pr-0 lg:border-r-0 lg:border-l lg:border-blue-200 lg:pl-10 xl:pl-12" : "lg:border-r lg:border-blue-200"}
            mb-4 lg:mb-0
            ${isRTL ? "text-right" : ""}
          `}
        >
          <Eyebrow label={loc(UI.philosophy, locale)} isRTL={isRTL} />
          <h3 className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl lg:text-3xl">
            {product.name}
          </h3>
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

      {/* Engineering block */}
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
            lg:w-55 xl:w-65 shrink-0
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

/* ── Story Part B: Physical Layers ────────────────────────────────────── */
function StoryLayersSection({ story, locale, isRTL }) {
  const layers = story.layers ?? [];

  if (!layers.length) return null;

  return (
    <div className="pt-8 sm:pt-10 border-t border-blue-200 mt-8 sm:mt-10">
      <div
        className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className="h-0.5 w-8 shrink-0 bg-blue-900" />
        <h3 className="text-xs uppercase tracking-widest text-slate-500">
          {loc(UI.physical, locale)}
        </h3>
      </div>

      <div dir="ltr" className="grid gap-0">
        {layers.map((layer, idx) => (
          <div
            key={idx}
            className="
              flex items-center gap-4
              border-b border-blue-200
              py-3 sm:py-4
              px-2 -mx-2 rounded-md
              hover:bg-blue-50/40
              transition-colors duration-150
            "
          >
            <div className="w-10 h-10 rounded-full border-2 border-blue-900 flex items-center justify-center shrink-0">
              <span className="text-blue-900 text-sm font-semibold">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 sm:text-base">
                {loc(layer.name, locale)}
              </p>
              {layer.description && (
                <p className="text-xs text-slate-600 sm:text-sm mt-1">
                  {loc(layer.description, locale)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Story Part C: Who It's For ────────────────────────────────────────── */
function StoryIdealForSection({ story, locale, isRTL }) {
  const items = story.idealFor ?? [];

  if (!items.length) return null;

  return (
    <div className="pt-8 sm:pt-10 border-t border-blue-200 mt-8 sm:mt-10">
      <div
        className={`flex flex-col lg:flex-row ${isRTL ? "lg:flex-row-reverse" : ""} lg:gap-0`}
      >
        {/* Label */}
        <div
          className={`
            lg:w-55 xl:w-65 shrink-0
            lg:pr-10 xl:pr-12
            ${isRTL ? "lg:pr-0 lg:border-r-0 lg:border-l lg:border-blue-200 lg:pl-10 xl:pl-12" : "lg:border-r lg:border-blue-200"}
            mb-6 lg:mb-0
            ${isRTL ? "text-right" : ""}
          `}
        >
          <Eyebrow label={loc(UI.idealFor, locale)} isRTL={isRTL} />
        </div>

        {/* Items grid */}
        <div
          className={`
            flex-1
            lg:pl-10 xl:pl-14
            ${isRTL ? "lg:pl-0 lg:pr-10 xl:pr-14" : ""}
            grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10
          `}
        >
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-blue-900 flex items-center justify-center shrink-0">
                <span className="text-blue-900 text-sm font-semibold">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 sm:text-base leading-relaxed">
                  {loc(item, locale)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Complete Story Tab Content ────────────────────────────────────────── */
function StoryTabContent({ product, locale, isRTL }) {
  const story = productStoryContent[product.slug];

  if (!story) return null;

  return (
    <div className="space-y-0">
      <StoryPhilosophyPart
        story={story}
        product={product}
        locale={locale}
        isRTL={isRTL}
      />
      <StoryLayersSection story={story} locale={locale} isRTL={isRTL} />
      <StoryIdealForSection story={story} locale={locale} isRTL={isRTL} />
    </div>
  );
}

/* ── Specs Tab Content ────────────────────────────────────────────────── */
function SpecsTabContent({ product, locale, isRTL }) {
  const technicalSpecs = product.details?.technicalSpecs ?? [];

  if (!technicalSpecs.length) return null;

  return (
    <div dir="ltr" className="grid gap-0">
      {technicalSpecs.map((spec) => (
        <div
          key={spec.label}
          className="
            flex justify-between items-center
            border-b border-blue-200
            py-3 sm:py-4
            px-2 -mx-2 rounded-md
            hover:bg-blue-50/40
            transition-colors duration-150
          "
        >
          <span className="text-sm font-medium text-blue-900 sm:text-base">
            {spec.label}
          </span>
          <span className="text-sm sm:text-base text-slate-600 text-right max-w-[60%]">
            {spec.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Tabs Component ──────────────────────────────────────────────── */
export default function ProductTabs() {
  const { product, locale } = useProduct();
  const [activeTab, setActiveTab] = useState("story");
  const isRTL = locale === "ar";

  return (
    <section className="mx-auto max-w-7xl border-t border-blue-200 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      {/* Tab navigation */}
      <div className={`flex gap-2 mb-8 sm:mb-10 border-b border-blue-200 pb-1`}>
        <TabButton
          isActive={activeTab === "story"}
          onClick={() => setActiveTab("story")}
          label={loc(UI.tabs.story, locale)}
          isRTL={isRTL}
        />
        <TabButton
          isActive={activeTab === "specs"}
          onClick={() => setActiveTab("specs")}
          label={loc(UI.tabs.specs, locale)}
          isRTL={isRTL}
        />
      </div>

      {/* Tab content */}
      {activeTab === "story" && (
        <StoryTabContent product={product} locale={locale} isRTL={isRTL} />
      )}
      {activeTab === "specs" && (
        <SpecsTabContent product={product} locale={locale} isRTL={isRTL} />
      )}
    </section>
  );
}
