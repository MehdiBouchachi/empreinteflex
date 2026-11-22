"use client";

import ProductCard from "./ProductCard";

/* ─── EMPTY STATE ─────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50/30 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-900/10">
        <svg
          className="h-8 w-8 text-blue-900"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7h18M5 7l1.5 12h11L19 7M9 7V5a3 3 0 016 0v2"
          />
        </svg>
      </div>
      <h3 className="mb-4 text-2xl font-semibold text-slate-900">
        No Products Found
      </h3>
      <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
        No mattresses match your current filters. Adjust your selection or
        explore our full collection.
      </p>
    </div>
  );
}

/* ─── MAIN EXPORT ─────────────────────────────────────────────────────────
   mobileLayout prop: "grid" | "list" — controlled by MattressesClient.
   No internal toggle state here — lifted to the parent.

   Animation strategy:
   • key={mobileLayout} on the grid wrapper forces React to unmount +
     remount the entire grid when layout switches. This triggers the
     CSS @keyframes animation fresh on every toggle.
   • The animation (gridAppear) is defined in globals.css:
       @keyframes gridAppear {
         from { opacity: 0; transform: translateY(6px); }
         to   { opacity: 1; transform: translateY(0); }
       }
       .animate-grid-appear {
         animation: gridAppear 0.28s cubic-bezier(0.25,0.4,0.25,1) both;
       }
   • Each card also gets a staggered animation-delay via nth-child in
     globals.css, same as before.
   • On sm+: mobileLayout is ignored visually — the inline style only
     overrides on mobile because sm:grid-cols-2 takes precedence above
     640px (Tailwind's responsive prefix wins over inline style when the
     media query is active... actually inline style always wins).
     So we guard the inline override with a data attribute and CSS:
       [data-layout="list"] { grid-template-columns: 1fr }
       @media (min-width: 640px) {
         [data-layout="list"] { grid-template-columns: repeat(2,minmax(0,1fr)) }
       }
     This keeps sm+ always at 2-col regardless of toggle state.
────────────────────────────────────────────────────────────────────────── */
export default function ProductGrid({
  products,
  productCardTranslation,
  locale = "en",
  mobileLayout = "grid",
}) {
  const isList = mobileLayout === "list";

  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      key={mobileLayout}
      data-layout={mobileLayout}
      className={`
        product-grid animate-grid-appear
        grid gap-3 sm:gap-8 lg:gap-10
        lg:grid-cols-3
        ${isList ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-2"}
      `}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          translation={productCardTranslation}
          locale={locale}
          mobileLayout={mobileLayout}
        />
      ))}
    </div>
  );
}
