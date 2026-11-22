"use client";

/* ═══════════════════════════════════════════════════════════════════════
   Custom toast hook + provider — no external library.

   WHY NOT a library (sonner, react-hot-toast, etc.):
   • The product page already has a ProductProvider context wrapping
     everything. Adding a second provider for a library creates nested
     contexts and import overhead for a single use case.
   • We need exactly: show, auto-dismiss, localized message. 3 lines of
     state. A library adds 10–30kb for the same result.
   • Full control over positioning, styling, and animation that matches
     the brand exactly.

   ARCHITECTURE:
   • useToast() hook exposes showToast(message)
   • ToastContainer renders the toast UI
   • Both are consumed by ProductInfoCard
   • State lives in a simple useState at the page level (ProductClient)
   • No global context needed — toast is scoped to the product page
════════════════════════════════════════════════════════════════════════ */
import { useState, useCallback, useRef } from "react";

export function useToast() {
  const [toast, setToast] = useState(null); // { id, message }
  const timerRef = useRef(null);

  const showToast = useCallback((message) => {
    /* Clear any existing timer so rapid clicks reset the duration */
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ id: Date.now(), message });

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, showToast, dismiss };
}
