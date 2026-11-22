/**
 * lib/meta-pixel.js
 * ─────────────────────────────────────────────────────────────────────────
 * Centralized Meta Pixel helper with full catalog alignment.
 *
 * Functions:
 *   initPixel()            — initializes FBC/FBP cookies on first load
 *   pageview()             — fires fbq("track", "PageView")
 *   trackMetaEvent(name, data) — fires fbq("track", name, data) with proper
 *                                content_ids alignment (MUST use slugs!)
 *
 * CRITICAL RULES:
 * ─────────────────────────────────────────────────────────────────────────
 * 1. content_ids MUST ALWAYS be product slugs, NEVER numeric IDs
 *    ✓ content_ids: ["classic-open"]  (slug)
 *    ✗ content_ids: [5]              (numeric ID)
 *
 * 2. Every event must include:
 *    - content_ids (array of slugs)
 *    - content_type: "product"
 *    - value (price in DZD)
 *    - currency: "DZD"
 *
 * 3. FBC (fbclid) tracking:
 *    - Captured from ?fbclid= URL param on first visit
 *    - Stored in _fbc cookie (180 days)
 *    - Sent automatically with all events
 *
 * 4. FBP (browser ID):
 *    - Managed by Meta Pixel SDK automatically
 *    - Always present (_fbp cookie)
 * ─────────────────────────────────────────────────────────────────────────
 */

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1759091491754572";

/**
 * Initialize FBC (Facebook Click ID) from URL parameter
 * Call this once on app mount (in root layout or app.js)
 */
export function initPixel() {
  if (typeof window === "undefined") return;

  // Extract fbclid from URL
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");

  if (fbclid) {
    // Store in _fbc cookie for 180 days
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 180 * 24 * 60 * 60 * 1000);
    const expires = `expires=${expiryDate.toUTCString()}`;
    document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; ${expires}; path=/; Secure; SameSite=Lax`;

    console.log("[META PIXEL] FBC Cookie set:", fbclid);
  }

  // Initialize fbq if not already done (Meta SDK handles this, but be defensive)
  if (typeof window.fbq === "undefined") {
    console.warn("[META PIXEL] fbq not loaded yet. Check Meta Pixel script.");
  }
}

/**
 * Read FBC from cookie and return for event payload
 * @returns {string|null} The _fbc value if found
 */
function getFbcValue() {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    const [name, value] = cookie.split("=");
    acc[name] = value;
    return acc;
  }, {});

  return cookies._fbc || null;
}

/**
 * Standard PageView — always fbq("track", "PageView")
 *
 * IMPORTANT: Do NOT call trackMetaEvent("PageView").
 * Always use pageview() — this is the only way to guarantee
 * Meta classifies it as a standard event.
 */
export function pageview() {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;

  console.log("META EVENT", "PageView", {});
  window.fbq("track", "PageView");
}

/**
 * Standard event tracker for all catalog-aligned events.
 *
 * Use for: ViewContent, AddToCart, InitiateCheckout, Purchase, etc.
 *
 * @param {string} eventName  — exact Meta standard event name
 * @param {object} params     — event payload
 *
 * SCHEMA (all events should follow this):
 * {
 *   content_ids: [array of product slugs],  ← CRITICAL: MUST be slugs!
 *   content_type: "product",
 *   value: price_in_dzd,
 *   currency: "DZD",
 *   [optional]: content_name, quantity, etc.
 * }
 *
 * EXAMPLES:
 * ─────────────────────────────────────────────────────────────────────────
 * ViewContent on product page:
 *   trackMetaEvent("ViewContent", {
 *     content_ids: ["classic-open"],
 *     content_type: "product",
 *     value: 35000,
 *     currency: "DZD"
 *   })
 *
 * AddToCart:
 *   trackMetaEvent("AddToCart", {
 *     content_ids: ["classic-open"],
 *     content_type: "product",
 *     value: 35000,
 *     currency: "DZD",
 *     quantity: 1
 *   })
 *
 * Purchase (on checkout success):
 *   trackMetaEvent("Purchase", {
 *     content_ids: ["classic-open", "ressort-prestige"],
 *     content_type: "product",
 *     value: 70000,
 *     currency: "DZD",
 *     num_items: 2
 *   })
 */
export function trackMetaEvent(eventName, params = {}) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;

  const normalizedPayload = {
    ...params,
    content_ids: Array.isArray(params.content_ids)
      ? params.content_ids
          .map((id) => (id == null ? "" : String(id).trim()))
          .filter(Boolean)
      : params.content_ids,
  };

  const fbc = getFbcValue();
  if (fbc && !normalizedPayload.fbc) {
    normalizedPayload.fbc = fbc;
  }

  // Validate content_ids are present
  if (
    !normalizedPayload.content_ids ||
    !Array.isArray(normalizedPayload.content_ids)
  ) {
    console.warn(
      `[META PIXEL] ${eventName} missing content_ids array:`,
      normalizedPayload,
    );
  }

  // Validate values are correct
  if (!normalizedPayload.content_type) {
    console.warn(
      `[META PIXEL] ${eventName} missing content_type:`,
      normalizedPayload,
    );
  }

  if (normalizedPayload.value === undefined) {
    console.warn(`[META PIXEL] ${eventName} missing value:`, normalizedPayload);
  }

  if (!normalizedPayload.currency) {
    console.warn(
      `[META PIXEL] ${eventName} missing currency:`,
      normalizedPayload,
    );
  }

  // Log event for debugging
  console.log("META EVENT", eventName, normalizedPayload);

  // Fire the event
  window.fbq("track", eventName, normalizedPayload);
}
