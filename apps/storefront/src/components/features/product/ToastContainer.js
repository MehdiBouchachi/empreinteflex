"use client";

/* ═══════════════════════════════════════════════════════════════════════
   ToastContainer — renders the toast UI.

   ANIMATION APPROACH:
   CSS @keyframes only. No Framer Motion for a toast.
   The animation is:
     enter: translateY(12px) + opacity 0  →  translateY(0) + opacity 1
     exit:  handled by the `key` prop — when toast.id changes, the old
            element is replaced (React unmounts it instantly). We only
            animate enter, which is simpler and cheaper.

   The CSS is inlined via a <style> tag in the component so it works
   without touching globals.css (self-contained). In production you'd
   move this to globals.css. The animation class is applied via className.

   PLACEMENT:
   • Desktop: bottom-right — non-intrusive, clear of the main CTA area
   • Mobile: bottom-center — easier to read, avoids thumb zones
   • fixed + z-50 so it floats above everything without affecting layout
   • pointer-events-none on the wrapper so it never blocks clicks
   • pointer-events-auto on the toast itself so it can be dismissed
════════════════════════════════════════════════════════════════════════ */
export default function ToastContainer({ toast, onDismiss }) {
  if (!toast) return null;

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .toast-animate {
          animation: toast-in 0.25s cubic-bezier(0.25, 0.4, 0.25, 1) both;
        }
      `}</style>

      {/* Wrapper — fixed, full-width on mobile, anchored bottom-right on desktop */}
      <div
        className="fixed bottom-6 left-0 right-0 sm:left-auto sm:right-6 z-50 flex justify-center sm:justify-end pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          key={toast.id}
          onClick={onDismiss}
          className="
            toast-animate
            pointer-events-auto
            flex items-center gap-3
            bg-blue-800 text-white
            px-5 py-3.5
            rounded-md
            shadow-[0_8px_32px_rgba(var(--rgb-brand-deep),0.18)]
            text-sm font-medium
            cursor-pointer
            select-none
            max-w-xs sm:max-w-sm
          "
        >
          {/* Checkmark icon — inline SVG, zero dependency */}
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
              <path
                d="M1 4L4 7L10 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {toast.message}
        </div>
      </div>
    </>
  );
}
