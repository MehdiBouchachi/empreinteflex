"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/utils/helpers";
import ProductImage from "@/components/ui/ProductImage";

/* ═══════════════════════════════════════════════════════════════════════
   RelatedSection — horizontal scroll carousels.

   FRAMER MOTION REMOVED entirely from this component.
   Original used motion.div with whileHover={{ y: -6 }} on each card.

   WHY REMOVED:
   • Each motion.div in a horizontal scroll list creates a compositor
     layer. With 3 sections × up to 5 cards each = up to 15 motion.div
     layers sitting in GPU memory.
   • The whileHover y:-6 is better expressed as CSS hover:-translate-y-1.5
     — fires on enter/leave, GPU-composited, identical visual result.

   ANIMATION KEPT:
   • CSS hover:-translate-y-1.5 on card (replaces Framer whileHover)
   • CSS group-hover:scale-[1.03] on image (replaces hover:scale-105,
     reduced slightly because the card also lifts — combined motion)
   • transition-[transform,box-shadow] duration-300 on card
   • hover:shadow-md on card (was present via Tailwind, kept)

   ALL OTHER ANIMATION REMOVED:
   • No Framer Motion imports
   • No motion.div wrappers
   • No JS-driven animations
════════════════════════════════════════════════════════════════════════ */
export default function RelatedSection({ currentProduct, allProducts }) {
  const params = useParams();
  const locale = params?.local || "en";
  const isRTL = locale === "ar";

  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const related = allProducts.filter(
    (p) =>
      p.slug !== currentProduct.slug && p.category === currentProduct.category,
  );
  const alsoBought = allProducts.filter(
    (p) =>
      p.slug !== currentProduct.slug &&
      p.subcategory === currentProduct.subcategory,
  );

  useEffect(() => {
    if (!currentProduct?.slug) return;
    const stored = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const updated = [
      currentProduct.slug,
      ...stored.filter((slug) => slug !== currentProduct.slug),
    ].slice(0, 5);
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
    const hydrated = updated
      .slice(1)
      .map((slug) => allProducts.find((p) => p.slug === slug))
      .filter(Boolean);
    setRecentlyViewed(hydrated);
  }, [currentProduct, allProducts]);

  const Section = ({ title, products }) => {
    const scrollRef = useRef(null);
    if (!products.length) return null;

    const scroll = (direction) => {
      const container = scrollRef.current;
      if (!container) return;
      const scrollValue =
        direction === "left"
          ? -container.offsetWidth * 0.8
          : container.offsetWidth * 0.8;
      container.scrollBy({
        left: isRTL ? -scrollValue : scrollValue,
        behavior: "smooth",
      });
    };

    return (
      <section className="relative border-t border-blue-200 py-10 sm:py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h2 className="mb-6 text-lg font-semibold text-slate-900 sm:mb-8 sm:text-2xl lg:text-3xl">
            {title}
          </h2>

          {products.length > 1 && (
            <>
              <button
                onClick={() => scroll("left")}
                className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white shadow-md transition-colors duration-200 hover:bg-blue-50 lg:flex ${isRTL ? "-right-5" : "-left-5"}`}
                aria-label="Scroll left"
              >
                {isRTL ? "›" : "‹"}
              </button>
              <button
                onClick={() => scroll("right")}
                className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-white shadow-md transition-colors duration-200 hover:bg-blue-50 lg:flex ${isRTL ? "-left-5" : "-right-5"}`}
                aria-label="Scroll right"
              >
                {isRTL ? "‹" : "›"}
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            dir={isRTL ? "rtl" : "ltr"}
            className="flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-4"
          >
            {products.map((item) => {
              const image = item.images?.[0] ?? item.image;
              const allPrices =
                item.details?.dimensions?.flatMap((d) =>
                  d.options?.map((o) => o.price),
                ) || [];
              const hasPrices = allPrices.length > 0;
              const minPrice = hasPrices ? Math.min(...allPrices) : null;
              const maxPrice = hasPrices ? Math.max(...allPrices) : null;
              const discount = item.discount ?? 0;
              const hasDiscount = discount > 0;
              const discountedMin = hasDiscount
                ? Math.round(minPrice * (1 - discount / 100))
                : minPrice;
              const discountedMax = hasDiscount
                ? Math.round(maxPrice * (1 - discount / 100))
                : maxPrice;

              return (
                /* CSS hover replaces Framer whileHover — same lift, zero JS */
                <div
                  key={item.slug}
                  className="
                    group snap-start flex-shrink-0
                    min-w-[190px] sm:min-w-[240px] lg:min-w-[280px]
                    rounded-md border border-blue-200 bg-white sm:rounded-md
                    shadow-sm hover:shadow-md
                    hover:-translate-y-1.5
                    transition-[transform,box-shadow] duration-300 ease-out
                  "
                >
                  {/* IMAGE */}
                  <div className="overflow-hidden rounded-t-xl relative h-[150px] sm:h-[190px] lg:h-[220px]">
                    <ProductImage
                      src={image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 60vw, 280px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    {hasDiscount && (
                      <div className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs text-white shadow-md">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-3 sm:p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                      {item.category}
                    </p>
                    <h3 className="mb-3 line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
                      {item.name}
                    </h3>

                    <div className="mb-4">
                      {hasPrices ? (
                        hasDiscount ? (
                          <>
                            <p className="text-base font-bold text-blue-900">
                              {formatPrice(discountedMin, locale)}
                              {discountedMin !== discountedMax &&
                                ` – ${formatPrice(discountedMax, locale)}`}
                            </p>
                            <p className="text-xs text-slate-400 line-through">
                              {formatPrice(minPrice, locale)}
                              {minPrice !== maxPrice &&
                                ` – ${formatPrice(maxPrice, locale)}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-base font-bold text-blue-900">
                            {formatPrice(minPrice, locale)}
                            {minPrice !== maxPrice &&
                              ` – ${formatPrice(maxPrice, locale)}`}
                          </p>
                        )
                      ) : (
                        <p className="text-xs text-slate-400">
                          {locale === "ar" ? "غير متوفر" : "Unavailable"}
                        </p>
                      )}
                    </div>

                    <Link href={`/${locale}/product/${item.slug}`}>
                      <Button size="sm" className="w-full">
                        {locale === "ar" ? "عرض المنتج" : "View Product"}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <Section
        title={locale === "ar" ? "منتجات ذات صلة" : "Related Products"}
        products={related}
      />
      <Section
        title={
          locale === "ar" ? "العملاء اشتروا أيضاً" : "Customers Also Bought"
        }
        products={alsoBought}
      />
      <Section
        title={locale === "ar" ? "شوهد مؤخراً" : "Recently Viewed"}
        products={recentlyViewed}
      />
    </>
  );
}
