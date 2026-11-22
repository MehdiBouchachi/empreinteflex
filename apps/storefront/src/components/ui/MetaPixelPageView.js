"use client";

/**
 * components/MetaPixelPageView.js
 * ─────────────────────────────────────────────────────────────────────────
 * Fires pageview() on every App Router client-side route change.
 * Skips the initial render — the base pixel init script already fired
 * fbq("track","PageView") on first load. This component handles only
 * subsequent navigations.
 *
 * What was wrong in the previous version:
 *   1. useSearchParams() requires Suspense — Suspense causes a two-pass
 *      render in React, which makes the useEffect fire TWICE on initial
 *      load. Combined with the init script's PageView, that's 3 calls on
 *      the first page — Meta received them out of sequence and classified
 *      the extra ones as custom events.
 *   2. No isMounted guard — the effect ran on the very first render,
 *      doubling the init script's PageView.
 *   3. The comment incorrectly claimed Meta deduplicates PageView
 *      client-side. It does not. Each fbq("track","PageView") call is
 *      processed independently.
 *
 * Fixes:
 *   • Removed useSearchParams entirely. usePathname() is sufficient —
 *     query string changes are not page navigations for analytics.
 *     No Suspense wrapper needed. No double-invoke risk.
 *   • Added isMounted ref. Skips the effect on the very first render.
 *     After that, every pathname change fires exactly one pageview().
 *
 * Result: exactly ONE PageView per page, every time, correctly classified
 * as a standard event by Meta.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { pageview } from "@/lib/meta-pixel";

export default function MetaPixelPageView() {
  const pathname = usePathname();
  const isMounted = useRef(false);

  useEffect(() => {
    // Skip the initial render — init script already fired PageView
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    // Subsequent navigations only
    pageview();
  }, [pathname]);

  return null;
}
