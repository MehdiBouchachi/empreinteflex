export function filterProducts(products, state) {
  return products
    .map((p) => {
      const pricingType =
        p.pricingType || (p.basePrice != null ? "SIMPLE" : "VARIANT_FULL");

      const isSimple = pricingType === "SIMPLE";
      const isDimensionOnly = pricingType === "VARIANT_DIMENSION";

      /* ── 1. CATEGORY ─────────────────────────────────────────────── */
      const categoryMatch =
        state.category === "all" ||
        p.category?.toLowerCase() === state.category.toLowerCase();

      const subMatch =
        state.subcategory === "all" ||
        p.subcategory?.toLowerCase() === state.subcategory.toLowerCase();

      if (!categoryMatch || !subMatch) return null;
      // A size search must only return available products with that dimension.
      if (state.size && (!p.available || !p.details?.dimensions?.some(
        (dimension) => dimension.size === state.size && dimension.options?.length,
      ))) return null;

      /* ── 2. SIMPLE products — fixed price, no variants ───────────────
         Size and thickness filters don't apply — pass through with
         basePrice as the effective price. Price range filter still applies.
      ─────────────────────────────────────────────────────────────────── */
      if (isSimple) {
        const raw = Number(p.basePrice) || 0;
        const discountPct = Number(p.discount) || 0;
        const effectivePrice =
          discountPct > 0 ? Math.round(raw * (1 - discountPct / 100)) : raw;

        // Apply price filter
        if (effectivePrice < state.minPrice || effectivePrice > state.maxPrice)
          return null;

        // Size/thickness filters are irrelevant for SIMPLE products — always pass
        return {
          ...p,
          dynamicPrice: effectivePrice,
          priceRange: null,
        };
      }

      /* ── 3. VARIANT_DIMENSION — dimension only, no thickness ─────────
         Thickness filter doesn't apply.
         If a size filter is active, match on dimension size.
      ─────────────────────────────────────────────────────────────────── */
      if (isDimensionOnly) {
        let dynamicPrice = null;
        let priceRange = null;

        if (state.size) {
          const dimension = p.details?.dimensions?.find(
            (d) => d.size === state.size,
          );
          if (!dimension) return null;

          const prices = dimension.options?.map((o) => o.price) || [];
          if (!prices.length) return null;

          // VARIANT_DIMENSION has one option per dimension (no thickness)
          dynamicPrice = prices[0];
        } else {
          const allPrices =
            p.details?.dimensions?.flatMap((d) =>
              d.options?.map((o) => o.price),
            ) || [];

          if (!allPrices.length) return null;

          priceRange = {
            min: Math.min(...allPrices),
            max: Math.max(...allPrices),
          };
        }

        const effectiveMin = dynamicPrice ?? priceRange?.min;
        const effectiveMax = dynamicPrice ?? priceRange?.max;

        if (effectiveMax < state.minPrice || effectiveMin > state.maxPrice)
          return null;

        // Thickness filter doesn't apply — pass through regardless
        return { ...p, dynamicPrice, priceRange };
      }

      /* ── 4. VARIANT_FULL — dimension + thickness (original logic) ─── */
      let dynamicPrice = null;
      let priceRange = null;

      if (state.size && state.thickness !== null) {
        const dimension = p.details?.dimensions?.find(
          (d) => d.size === state.size,
        );
        const option = dimension?.options?.find(
          (o) => o.thickness === state.thickness,
        );
        if (!option) return null;

        dynamicPrice = option.price;
      } else if (state.size) {
        const dimension = p.details?.dimensions?.find(
          (d) => d.size === state.size,
        );
        if (!dimension) return null;

        const prices = dimension.options?.map((o) => o.price) || [];
        if (!prices.length) return null;

        priceRange = {
          min: Math.min(...prices),
          max: Math.max(...prices),
        };
      } else {
        const allPrices =
          p.details?.dimensions?.flatMap((d) =>
            d.options?.map((o) => o.price),
          ) || [];

        if (!allPrices.length) return null;

        priceRange = {
          min: Math.min(...allPrices),
          max: Math.max(...allPrices),
        };
      }

      const effectiveMin = dynamicPrice ?? priceRange?.min;
      const effectiveMax = dynamicPrice ?? priceRange?.max;

      if (effectiveMax < state.minPrice || effectiveMin > state.maxPrice)
        return null;

      return { ...p, dynamicPrice, priceRange };
    })
    .filter(Boolean);
}
