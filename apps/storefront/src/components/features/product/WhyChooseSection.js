"use client";

import { useProduct } from "./ProductContext";

/* ═══════════════════════════════════════════════════════════════════════
   WhyChooseSection — purely textual benefit list.

   ANIMATION: CSS fade-up on the section container only.
   No per-item animation. No JS observers. The section-level fade is
   enough — it signals "new content" as the user scrolls down.

   The original had no animation, which was already correct for this
   section. The only addition is the CSS animation-timeline approach
   using @keyframes from the page-level style tag — but since this
   component doesn't have access to that style tag, we inline one here.

   Actually the cleanest approach for a section that's below the fold:
   use Tailwind v4's @starting-style equivalent via CSS, or just rely
   on the page-enter animation from ProductClient covering the initial
   above-fold content, and leave below-fold sections static.

   DECISION: leave completely static. The page-enter animation on
   ProductClient covers the hero area. Below-fold sections gain nothing
   from a reveal — users have already scrolled intentionally to read them.
   Static = fastest = most premium for textual content sections.
════════════════════════════════════════════════════════════════════════ */
export default function WhyChooseSection() {
  const { product, locale, translation } = useProduct();
  const whyChoose = product.details?.whyChoose ?? [];

  if (!whyChoose.length) return null;

  return (
    <section className="mx-auto max-w-7xl border-t border-blue-200 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="max-w-3xl mb-14">
        <div className="mb-6 h-[2px] w-12 bg-blue-900" />
        <h2 className="mb-6 text-xl font-semibold text-slate-900 sm:mb-8 sm:text-2xl lg:text-3xl">
          {translation.whyChoose?.title ?? "Why Choose This Product?"}
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {translation.whyChoose?.desc ??
            "Every detail is designed to provide reliable support, long-term durability, and consistent comfort night after night."}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-x-16 gap-y-14">
        {whyChoose.map((item, i) => (
          <div key={item.id ?? i} className="flex gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-900 text-sm font-semibold text-blue-900">
                {i + 1}
              </div>
            </div>
            <div>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                {item.translations?.[locale] ?? item.translations?.en ?? ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
