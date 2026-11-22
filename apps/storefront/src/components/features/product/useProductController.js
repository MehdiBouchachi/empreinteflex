import { useReducer, useMemo, useEffect } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "SET_IMAGE":
      return { ...state, selectedImage: action.payload };

    case "SET_DIMENSION":
      return { ...state, selectedDimension: action.payload };

    case "SET_DENSITY":
      return { ...state, selectedDensity: action.payload };

    case "SET_THICKNESS":
      return { ...state, selectedThickness: action.payload };

    case "SET_QUANTITY":
      return { ...state, quantity: action.payload };

    case "TOGGLE_FAQ":
      return {
        ...state,
        openFAQ: state.openFAQ === action.payload ? null : action.payload,
      };

    case "SET_ZOOM":
      return { ...state, zoomStyle: action.payload };

    default:
      return state;
  }
}

export function useProductController(product) {
  const pricingType = product.pricingType || "VARIANT_FULL";
  const isSimple = pricingType === "SIMPLE";
  const isDimensionOnly = pricingType === "VARIANT_DIMENSION";

  const initialState = {
    selectedImage: product.images?.[0] ?? null,
    selectedDimension: product.details?.dimensions?.[0] ?? null,
    selectedDensity: product.details?.densities?.[0]?.value ?? null,
    /* For SIMPLE: no thickness needed.
       For VARIANT_DIMENSION: thickness also not needed — price is per dimension.
       For VARIANT_FULL: auto-selected below via useEffect. */
    selectedThickness: null,
    quantity: 1,
    openFAQ: null,
    zoomStyle: {},
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  /* ── Auto thickness selection ────────────────────────────────────────
     Only applies to VARIANT_FULL.
     VARIANT_DIMENSION: options have thickness=null, price is on the option
     directly — we treat the first option as "selected" for pricing.
     SIMPLE: no variants at all.
  ─────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isSimple) return;

    if (!state.selectedDimension?.options) return;

    let filtered = state.selectedDimension.options;

    if (state.selectedDensity) {
      filtered = filtered.filter(
        (opt) => opt.density === state.selectedDensity,
      );
    }

    if (filtered.length > 0) {
      const sorted = [...filtered].sort(
        (a, b) => (a.thickness ?? 0) - (b.thickness ?? 0),
      );
      dispatch({ type: "SET_THICKNESS", payload: sorted[0] });
    }
  }, [state.selectedDimension, state.selectedDensity, isSimple]);

  /* ── Pricing — pricing_type aware ───────────────────────────────────
     SIMPLE:            base = product.basePrice, no variant needed
     VARIANT_DIMENSION: base = selectedDimension.options[0].price
                        (first/only option per dimension, no thickness)
     VARIANT_FULL:      base = selectedThickness.price (existing behavior)
  ─────────────────────────────────────────────────────────────────────── */
  const pricing = useMemo(() => {
    let base = 0;

    if (isSimple) {
      base = product.basePrice ?? 0;
    } else if (isDimensionOnly) {
      // VARIANT_DIMENSION: one option per dimension, thickness is null
      base = state.selectedDimension?.options?.[0]?.price ?? 0;
    } else {
      // VARIANT_FULL
      base = state.selectedThickness?.price ?? 0;
    }

    const discount = product.discount ?? 0;
    const hasDiscount = discount > 0;
    const discounted = hasDiscount
      ? Math.round(base * (1 - discount / 100))
      : base;

    return {
      base,
      discount,
      hasDiscount,
      discounted,
      total: discounted * state.quantity,
    };
  }, [
    isSimple,
    isDimensionOnly,
    product.basePrice,
    product.discount,
    state.selectedDimension,
    state.selectedThickness,
    state.quantity,
  ]);

  return { state, dispatch, pricing, pricingType };
}
