"use client";

import { useProduct } from "./ProductContext";

/* ═══════════════════════════════════════════════════════════════════════
   TechnicalSpecsSection — spec rows.

   ANIMATION: none. Deliberately.
   Technical specs are reference content. Users scroll here to read
   specific values. Any animation here delays that — it's anti-UX.

   The only change from original: added hover:bg-blue-50/40 on each row
   so users get visual feedback when reading a specific row. This is a
   CSS transition on background-color — single restyle, zero paint cost.
════════════════════════════════════════════════════════════════════════ */
export default function TechnicalSpecsSection() {
  const { product, translation } = useProduct();
  const technicalSpecs = product.details?.technicalSpecs ?? [];

  if (!technicalSpecs.length) return null;

  return (
    <section className="mx-auto max-w-7xl border-t border-blue-200 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <h2 className="mb-6 text-xl font-semibold text-slate-900 sm:mb-8 sm:text-2xl lg:text-3xl">
        {translation.features}
      </h2>

      <div dir="ltr" className="grid gap-0">
        {technicalSpecs.map((spec, i) => (
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
    </section>
  );
}
