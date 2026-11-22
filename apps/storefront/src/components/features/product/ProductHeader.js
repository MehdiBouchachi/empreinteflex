"use client";

import { useProduct } from "./ProductContext";

/* ═══════════════════════════════════════════════════════════════════════
   ProductHeader — breadcrumb + back button.

   ANIMATION: none. Deliberately.
   This is navigation chrome — it should be instantly readable.
   The page-enter animation on ProductClient already provides the
   section-level reveal. Adding a second animation here stacks cost
   for zero user value.

   CHANGES from original:
   • Added transition-colors duration-200 to breadcrumb buttons
     (was just `transition` which evaluates all properties)
   • Added hover:text-blue-900 to back button (was only hover:underline)
   • Everything else untouched — structure is clean and correct
════════════════════════════════════════════════════════════════════════ */
export default function ProductHeader() {
  const { product, locale, translation, router } = useProduct();
  const { breadcrumb } = translation;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 mb-4">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="transition-colors duration-200 hover:text-blue-900"
        >
          {breadcrumb.home}
        </button>

        <span>/</span>

        <button
          onClick={() => router.push(`/${locale}/mattresses`)}
          className="transition-colors duration-200 hover:text-blue-900"
        >
          {breadcrumb.collection}
        </button>

        <span>/</span>

        <span className="max-w-[150px] truncate font-medium text-blue-900">
          {product.name}
        </span>
      </div>

      <button
        onClick={() => router.back()}
        className="text-xs text-blue-900 transition-colors duration-200 hover:text-blue-900 hover:underline sm:text-sm"
      >
        ← {breadcrumb.back}
      </button>
    </section>
  );
}
