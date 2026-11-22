"use client";

/**
 * ProductClient.js
 * ─────────────────────────────────────────────────────────────────────────
 * Meta Pixel integration — adapted to the real ProductContext architecture.
 *
 * How ProductContext actually works (from uploaded files):
 *   • ProductProvider wraps useProductController(product)
 *   • useProductController returns { state, dispatch, pricing }
 *   • ProductContext.value = { product, locale, translation, router,
 *                              handleAddToCart, ...state, ...dispatch, ...pricing }
 *   • pricing.discounted is the current per-unit discounted price
 *   • state.quantity is the current selected quantity
 *
 * ViewContent:
 *   Fired inside ProductPageInner (inside Provider) via useEffect([]).
 *   Uses pricing.discounted as the value — this is the real current price
 *   after discount, computed from useProductController.
 *
 * AddToCart:
 *   handleAddToCartTracked wraps context's handleAddToCart.
 *   It dispatches to Redux AND fires the pixel with the same pricing
 *   values that were used for the Redux dispatch.
 *   Passed to ProductInfoCard as onAddToCartTracked prop.
 *
 * Nothing else changes — page structure, sections, toast, animation
 *   are all identical to the uploaded ProductClient.js.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react";
import ProductHeader from "./ProductHeader";
import ProductGallery from "./ProductGallery";
import ProductInfoCard from "./ProductInfoCard";
import DecisionBlock from "./DecisionBlock";
import ProductTabs from "./ProductTabs";
import WhyChooseSection from "./WhyChooseSection";
import FAQSection from "./FAQSection";
import ProductProvider from "./ProductContext";
import { useProduct } from "./ProductContext";
import RelatedSection from "./RelatedSection";
import ToastContainer from "./ToastContainer";
import { useToast } from "./useToast";
import { trackMetaEvent } from "@/lib/meta-pixel";

/* ─────────────────────────────────────────────────────────────────────────
   ProductPageInner
   Must live inside <ProductProvider> to access useProduct().
   Owns both pixel events that require product/pricing context.
───────────────────────────────────────────────────────────────────────── */
function ProductPageInner({ showToast }) {
  const { product, state, pricing, handleAddToCart } = useProduct();

  /* ── ViewContent — fires once when product page mounts ──────────────
     CRITICAL: content_ids MUST use product.slug (NOT numeric ID)
     This ensures alignment with the Meta catalog feed.
     
     pricing.discounted: per-unit price after discount, from
     useProductController's useMemo. Stable after initial render.
     state.quantity is 1 on mount (initialState in useProductController).
  ── */
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_ids: [product.slug], // ✓ Using slug, NOT product.id
      content_type: "product",
      value: pricing.discounted ?? 0,
      currency: "DZD",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] — intentional: fire once per page mount

  /* ── AddToCart — UI-layer wrapper ───────────────────────────────────
     Mirrors exactly what handleAddToCart() in ProductContext does:
       dispatchRedux(addToCart({
         id, name, image, price: pricing.discounted,
         size, thickness, density, quantity
       }))
     We fire the pixel with the same values immediately after.
     Both calls are synchronous — no race condition.
     
     CRITICAL: content_ids MUST use product.slug
  ── */
  const handleAddToCartTracked = () => {
    handleAddToCart(); // → Redux dispatch via ProductContext

    trackMetaEvent("AddToCart", {
      content_ids: [product.slug], // ✓ Using slug, NOT product.id
      content_type: "product",
      value: pricing.discounted ?? 0, // same price used in Redux dispatch
      currency: "DZD",
      quantity: state.quantity ?? 1, // same quantity used in Redux dispatch
    });
  };

  return (
    <>
      {/* SECTION 1: HERO — gallery + purchase widget (2-column desktop) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 grid lg:grid-cols-[1.5fr_1fr] gap-8 sm:gap-12 lg:gap-16 items-start">
        <ProductGallery />
        <ProductInfoCard
          showToast={showToast}
          onAddToCartTracked={handleAddToCartTracked}
        />
      </section>

      {/* SECTION 2: QUICK DECISION BLOCK */}
      <DecisionBlock />

      {/* SECTION 3: PRODUCT STORY + SPECS (TABBED) */}
      <ProductTabs />

      {/* SECTION 4: WHY CHOOSE / BENEFITS */}
      <WhyChooseSection />

      {/* SECTION 5: FAQ */}
      <FAQSection />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ProductClient — outer shell
   Identical structure to the uploaded file.
───────────────────────────────────────────────────────────────────────── */
export default function ProductClient({
  product,
  locale,
  allProducts,
  translation,
}) {
  const relatedProducts = allProducts.filter(
    (p) => p.slug !== product.slug && p.category === product.category,
  );

  const { toast, showToast, dismiss } = useToast();

  return (
    <ProductProvider
      product={product}
      locale={locale}
      translation={translation}
    >
      <>
        <style>{`
          @keyframes page-enter {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .page-enter {
            animation: page-enter 0.4s cubic-bezier(0.25, 0.4, 0.25, 1) both;
          }
          @media (prefers-reduced-motion: reduce) {
            .page-enter { animation: none; }
          }
        `}</style>

        <div className="bg-white min-h-screen page-enter">
          {/* Breadcrumb + back nav */}
          <ProductHeader />

          {/* Inner — has ProductContext access, owns pixel tracking */}
          <ProductPageInner showToast={showToast} />

          {/* Related products */}
          <RelatedSection
            currentProduct={product}
            allProducts={relatedProducts}
          />
        </div>

        {/* Toast floats outside animated div — renders at full opacity */}
        <ToastContainer toast={toast} onDismiss={dismiss} />
      </>
    </ProductProvider>
  );
}
