"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import CategoryFilter from "./CategoryFilter";
import SubcategoryFilter from "./SubcategoryFilter";
import TypeFilter from "./TypeFilter";
import PriceFilter from "./PriceFilter";
import DimensionFilter from "./DimensionFilter";
import { useScrollChromeVisibility } from "@/components/layout/ScrollChromeProvider";

/* ── SORT OPTIONS ─────────────────────────────────────────────────────── */
const SORT_OPTIONS = {
  en: [
    { value: "default", label: "Default" },
    { value: "asc", label: "Price: Low → High" },
    { value: "desc", label: "Price: High → Low" },
  ],
  fr: [
    { value: "default", label: "Par défaut" },
    { value: "asc", label: "Prix : Croissant" },
    { value: "desc", label: "Prix : Décroissant" },
  ],
  ar: [
    { value: "default", label: "افتراضي" },
    { value: "asc", label: "السعر: من الأقل" },
    { value: "desc", label: "السعر: من الأعلى" },
  ],
};

const SORT_LABELS = {
  en: "Sort by",
  fr: "Trier par",
  ar: "ترتيب حسب",
};

export default function Filters({
  filtersTranslation,
  locale,
  categories,
  dimensions,
  thicknesses,
  /* Sort state lifted from MattressesClient */
  sortOrder,
  onSortChange,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const { isMobileViewport, floatingMobileBaseOffset, isFooterInView } =
    useScrollChromeVisibility();
  const hideButton = isFooterInView;

  const isRTL = locale === "ar";
  const sortOpts = SORT_OPTIONS[locale] ?? SORT_OPTIONS.en;
  const sortLabel = SORT_LABELS[locale] ?? SORT_LABELS.en;

  /* ================= ACTIVE FILTER COUNT ================= */
  const activeCount = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    let count = [...params.keys()].filter((k) => k !== "page").length;
    if (sortOrder && sortOrder !== "default") count += 1;
    return count;
  }, [searchParams, sortOrder]);

  /* ================= SET PARAM ================= */
  const setParam = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  /* ================= RESET FILTERS ================= */
  const resetFilters = () => {
    onSortChange?.("default");
    router.push(`?`, { scroll: false });
    setOpen(false);
  };

  /* ================= DETECT DESKTOP ================= */
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  /* ================= BUTTON POP ================= */
  useEffect(() => {
    if (!hideButton) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setButtonVisible(false);
      const timeout = setTimeout(() => setButtonVisible(true), 60);
      return () => clearTimeout(timeout);
    }
  }, [hideButton]);

  /* ================= SCROLL LOCK ================= */
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    return () => {
      const storedScrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(storedScrollY || "0") * -1);
    };
  }, [open]);

  /* ── Current sort label for badge ── */
  const activeSortLabel = sortOpts.find((o) => o.value === sortOrder)?.label;
  const showSortBadge = sortOrder && sortOrder !== "default";

  return (
    <>
      {/* ── FLOATING BUTTON ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!hideButton && buttonVisible && (
          <motion.button
            initial={{ scale: 0.92, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(true)}
            className="
              fixed right-4 md:bottom-6 md:right-6
              z-40
              flex items-center gap-2
              border border-white/20 bg-blue-900 text-white
              px-3 py-2 rounded-md
              shadow-md text-sm font-medium
              hover:bg-blue-800 transition-colors duration-300
            "
            style={
              isMobileViewport
                ? { bottom: `${floatingMobileBaseOffset}px` }
                : undefined
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4h18M6 12h12M10 20h4"
              />
            </svg>

            {isRTL ? "الفلاتر" : "Filters"}

            {activeCount > 0 && (
              <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-blue-900">
                {activeCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── DRAWER ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Drawer panel */}
            <motion.div
              initial={isDesktop ? { x: "100%" } : { y: "100%" }}
              animate={isDesktop ? { x: 0 } : { y: 0 }}
              exit={isDesktop ? { x: "100%" } : { y: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={`fixed z-50 bg-white shadow-2xl flex flex-col ${
                isDesktop
                  ? "top-0 right-0 h-full w-[420px] rounded-l-md"
                  : "bottom-0 left-0 right-0 rounded-t-md max-h-[85vh]"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-blue-200 px-8 py-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {isRTL
                    ? "الفلاتر والترتيب"
                    : locale === "fr"
                      ? "Filtres & tri"
                      : "Filters & Sort"}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-900"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10">
                {/* ── SORT SECTION — top of drawer ────────────────────── */}
                <div>
                  <h3
                    className={`
                    text-xs sm:text-sm mb-4
                    text-slate-500
                    ${isRTL ? "text-right tracking-normal" : "uppercase tracking-[0.25em] text-left"}
                  `}
                  >
                    {sortLabel}
                  </h3>

                  <div className="grid grid-cols-1 gap-2">
                    {sortOpts.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => onSortChange?.(opt.value)}
                        className={`
                          w-full flex items-center justify-between
                          px-4 py-3 rounded-md text-sm
                          transition-all duration-200
                          ${isRTL ? "flex-row-reverse text-right" : "text-left"}
                          ${
                            sortOrder === opt.value
                              ? "bg-blue-900 font-medium text-white"
                              : "bg-blue-50/60 text-slate-600 hover:bg-blue-50 hover:text-blue-900"
                          }
                        `}
                      >
                        <span>{opt.label}</span>
                        {sortOrder === opt.value && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                          >
                            <path
                              d="M2 7l3.5 3.5L12 3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── DIVIDER ─────────────────────────────────────────── */}
                <div className="h-px bg-blue-200" />

                {/* ── FILTER SECTIONS ─────────────────────────────────── */}
                <CategoryFilter
                  locale={locale}
                  translation={filtersTranslation}
                  setParam={setParam}
                  searchParams={searchParams}
                  categories={categories.filter((c) => c.type === "main")}
                />

                <SubcategoryFilter
                  locale={locale}
                  translation={filtersTranslation}
                  setParam={setParam}
                  searchParams={searchParams}
                  categories={categories}
                />

                <TypeFilter
                  locale={locale}
                  translation={filtersTranslation}
                  setParam={setParam}
                  searchParams={searchParams}
                  categories={categories}
                />

                <PriceFilter
                  locale={locale}
                  translation={filtersTranslation}
                  setParam={setParam}
                  searchParams={searchParams}
                />

                <DimensionFilter
                  translation={filtersTranslation}
                  setParam={setParam}
                  searchParams={searchParams}
                  dimensions={dimensions}
                  thicknesses={thicknesses}
                />
              </div>

              {/* FOOTER */}
              <div className="flex gap-3 border-t border-blue-200 px-8 py-6">
                <button
                  onClick={resetFilters}
                  className="flex-1 rounded-md border border-blue-200 py-3 text-sm font-medium text-blue-900 transition-colors hover:bg-blue-50"
                >
                  {isRTL
                    ? "إعادة ضبط"
                    : locale === "fr"
                      ? "Réinitialiser"
                      : "Reset all"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md bg-blue-900 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-800"
                >
                  {isRTL ? "تطبيق" : locale === "fr" ? "Appliquer" : "Apply"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
