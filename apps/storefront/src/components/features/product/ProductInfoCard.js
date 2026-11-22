"use client";

/**
 * ProductInfoCard.js — REFACTORED
 * ─────────────────────────────────────────────────────────────────────────
 * Premium product detail card. RIGHT column in 2-column desktop layout.
 *
 * DESIGN PRINCIPLES:
 * • Calm, unhurried hierarchy
 * • Strong visual progression toward CTA
 * • Premium typography
 * • Minimal interactive elements
 * • Perfect mobile + desktop experience
 *
 * LAYOUT:
 * • Badge + Title + Description
 * • Price (prominent)
 * • Variant selectors (buttons, not dropdowns)
 * • Quantity stepper
 * • CTA buttons
 * • Trust bullets (optional)
 *
 * MOBILE: Full width, sticky bottom CTA bar
 * DESKTOP: Right column, normal flow
 * ─────────────────────────────────────────────────────────────────────────
 */

import { formatPrice } from "@/utils/helpers";
import { useProduct } from "./ProductContext";

const ADDED_MESSAGES = {
  en: "Added to cart",
  fr: "Produit ajouté au panier",
  ar: "تمت الإضافة إلى السلة",
};

/* ── Label Badge Component ────────────────────────────────────────────── */
function CategoryBadge({ label }) {
  return (
    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-600">
      {label}
    </span>
  );
}

/* ── Price Display Component ──────────────────────────────────────────── */
function PriceSection({ pricing, quantity, locale }) {
  const {
    base: unitBasePrice,
    discounted: discountedUnitPrice,
    total: totalPrice,
    discount,
    hasDiscount,
  } = pricing;

  return (
    <div className="mb-8 rounded-md border border-blue-100 bg-blue-50/40 p-5 sm:p-6">
      {hasDiscount && (
        <p className="mb-2 text-sm text-slate-500 line-through">
          {formatPrice(unitBasePrice, locale)}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-3 sm:gap-4">
        <span className="text-4xl sm:text-5xl font-bold text-blue-900">
          {formatPrice(
            quantity === 1 ? discountedUnitPrice : totalPrice,
            locale,
          )}
        </span>

        {quantity > 1 && (
          <span className="text-xs sm:text-sm text-slate-600 pb-1">
            ({quantity} × {formatPrice(discountedUnitPrice, locale)})
          </span>
        )}

        {hasDiscount && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            −{discount}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Selector Button Component ────────────────────────────────────────── */
function SelectorButton({ isSelected, onClick, children }) {
  return (
    <button
      dir="ltr"
      type="button"
      onClick={onClick}
      className={`
        min-h-11 py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base
        rounded-md sm:rounded-md border transition-all duration-200
        font-medium cursor-pointer
        ${
          isSelected
            ? "bg-blue-900 text-white border-blue-900 shadow-[0_8px_18px_rgba(26,60,158,0.15)]"
            : "bg-white border-blue-200 text-blue-900 hover:border-blue-300 hover:bg-blue-50/50"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ── Selector Section Component ────────────────────────────────────────── */
function SelectorSection({ title, children }) {
  return (
    <div className="mb-6 sm:mb-7">
      <h3 className="mb-3 text-xs uppercase tracking-wider font-semibold text-slate-600">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ── Quantity Stepper Component ────────────────────────────────────────── */
function QuantityStepper({ quantity, onQuantityChange }) {
  return (
    <div className="inline-flex items-center gap-0 rounded-md border border-blue-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
        className="px-3 sm:px-4 py-2 sm:py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 font-medium"
        aria-label="Decrease quantity"
      >
        −
      </button>

      <div className="min-w-12 text-center font-semibold text-blue-900 px-2">
        {quantity}
      </div>

      <button
        type="button"
        onClick={() => onQuantityChange(quantity + 1)}
        className="px-3 sm:px-4 py-2 sm:py-3 text-blue-900 hover:bg-blue-50 transition-colors duration-150 font-medium"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

/* ── CTA Section Component ────────────────────────────────────────── */
function CTASection({ onCheckout, onAddToCart, buyNowLabel, addToCartLabel }) {
  return (
    <div className="space-y-3">
      {/* Primary CTA: Buy Now */}
      <button
        onClick={onCheckout}
        className="
          w-full py-3.5 sm:py-4 px-4
          bg-blue-900 text-white font-semibold rounded-md
          transition-all duration-200
          hover:bg-blue-800 active:scale-[0.98]
          shadow-[0_10px_24px_rgba(26,60,158,0.2)]
        "
      >
        {buyNowLabel}
      </button>

      {/* Secondary CTA: Add to Cart */}
      <button
        onClick={onAddToCart}
        className="
          w-full py-3 sm:py-3.5 px-4
          border-2 border-blue-900 text-blue-900 font-semibold rounded-md
          transition-all duration-200
          hover:bg-blue-50 active:scale-[0.98]
        "
      >
        {addToCartLabel}
      </button>
    </div>
  );
}

/* ── Trust Bullets Component ──────────────────────────────────────────── */
function TrustBullets({ guarantees }) {
  return (
    <div className="border-t border-blue-200 pt-4 mt-4 text-center">
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        {guarantees}
      </p>
    </div>
  );
}

/* ── Main ProductInfoCard Component ────────────────────────────────────── */
export default function ProductInfoCard({ showToast, onAddToCartTracked }) {
  const {
    product,
    locale,
    translation,
    state,
    dispatch,
    pricing,
    pricingType,
    router,
    handleAddToCart,
  } = useProduct();

  const isSimple = pricingType === "SIMPLE";
  const isVariantFull = pricingType === "VARIANT_FULL";

  const { selectedDimension, selectedDensity, selectedThickness, quantity } =
    state;

  const {
    size: sizeTranslation,
    thickness: thicknessTranslation,
    quantity: quantityTranslation,
    actions: actionTranslation,
    guarantees: guaranteesTranslation,
  } = translation;

  const dimensions = product.details?.dimensions ?? [];
  const densities = product.details?.densities ?? [];

  const categoryLabel =
    product.categoryTranslations?.[locale] ||
    product.categoryTranslations?.fr ||
    product.categoryTranslations?.en ||
    product.category;

  const subcategoryLabel =
    product.subcategoryTranslations?.[locale] ||
    product.subcategoryTranslations?.fr ||
    product.subcategoryTranslations?.en ||
    product.subcategory;

  const categoryPill = [categoryLabel, subcategoryLabel]
    .filter(Boolean)
    .join(" · ");

  const availableThicknessOptions =
    isVariantFull && selectedDimension?.options?.length > 0
      ? selectedDimension.options
          .filter((opt) =>
            selectedDensity ? opt.density === selectedDensity : true,
          )
          .sort((a, b) => a.thickness - b.thickness)
      : [];

  const onAddToCart = () => {
    if (onAddToCartTracked) {
      onAddToCartTracked();
    } else {
      handleAddToCart();
    }

    const message = ADDED_MESSAGES[locale] ?? ADDED_MESSAGES.en;
    showToast(message);
  };

  const handleCheckout = () => {
    handleAddToCart();
    router.push(`/${locale}/checkout`);
  };

  return (
    <div className="flex flex-col">
      {/* ── Top Section: Header + Pricing ────────────────────────────── */}
      <div>
        {/* Category Badge */}
        <div className="mb-4">
          <CategoryBadge label={categoryPill} />
        </div>

        {/* Product Title */}
        <h1 className="mb-3 text-3xl sm:text-4xl lg:text-4xl font-bold leading-tight text-slate-900">
          {product.name}
        </h1>

        {/* Product Description */}
        {product.description && (
          <p className="mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed text-slate-600">
            {product.description}
          </p>
        )}

        {/* Price Section */}
        <PriceSection pricing={pricing} quantity={quantity} locale={locale} />
      </div>

      {/* ── Middle Section: Selectors ────────────────────────────────── */}
      <div className="mb-8 space-y-6">
        {/* Size Selector */}
        {!isSimple && dimensions.length > 0 && (
          <SelectorSection title={sizeTranslation}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {dimensions.map((dim) => (
                <SelectorButton
                  key={dim.size}
                  isSelected={selectedDimension?.size === dim.size}
                  onClick={() =>
                    dispatch({ type: "SET_DIMENSION", payload: dim })
                  }
                >
                  {dim.size} cm
                </SelectorButton>
              ))}
            </div>
          </SelectorSection>
        )}

        {/* Thickness Selector */}
        {isVariantFull && selectedDimension?.options?.length > 0 && (
          <SelectorSection title={thicknessTranslation}>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {availableThicknessOptions.map((opt) => (
                <SelectorButton
                  key={`${opt.thickness}-${opt.density || "default"}`}
                  isSelected={selectedThickness?.thickness === opt.thickness}
                  onClick={() =>
                    dispatch({ type: "SET_THICKNESS", payload: opt })
                  }
                >
                  {opt.thickness} cm
                </SelectorButton>
              ))}
            </div>
          </SelectorSection>
        )}

        {/* Quantity Selector */}
        <SelectorSection title={quantityTranslation}>
          <QuantityStepper
            quantity={quantity}
            onQuantityChange={(newQty) =>
              dispatch({ type: "SET_QUANTITY", payload: newQty })
            }
          />
        </SelectorSection>
      </div>

      {/* ── Bottom Section: CTA Buttons ──────────────────────────────── */}
      <div className="space-y-4">
        <CTASection
          onCheckout={handleCheckout}
          onAddToCart={onAddToCart}
          buyNowLabel={actionTranslation.buyNow}
          addToCartLabel={actionTranslation.addToCart}
        />

        <TrustBullets guarantees={guaranteesTranslation} />
      </div>
    </div>
  );
}
