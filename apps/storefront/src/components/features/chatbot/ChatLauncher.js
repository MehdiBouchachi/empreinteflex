"use client";

import { IoChatbubbleEllipses, IoClose } from "react-icons/io5";

import { useScrollChromeVisibility } from "@/components/layout/ScrollChromeProvider";

/* Floating launcher — anchored bottom-LEFT so it never collides with the
   bottom-right WhatsApp FAB, and lifted above the mobile bottom-nav using the
   same ScrollChromeProvider offset the WhatsApp button uses. */
export default function ChatLauncher({ isOpen, onToggle, label }) {
  const { isMobileViewport, floatingMobileBaseOffset, isFooterInView } =
    useScrollChromeVisibility();

  const hideOnMobileFooter = isMobileViewport && isFooterInView;

  return (
    <div
      className={`fixed left-3 z-40 sm:left-4 md:bottom-6 md:left-6 transition-[bottom,transform,opacity] duration-300 ease-out ${
        hideOnMobileFooter ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"
      }`}
      style={isMobileViewport ? { bottom: `${floatingMobileBaseOffset}px` } : undefined}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        aria-expanded={isOpen}
        title={label}
        className="
          group relative flex h-13 w-13 items-center justify-center rounded-full
          bg-[var(--color-brand-primary)] text-white sm:h-14 sm:w-14
          shadow-[0_12px_30px_rgba(var(--rgb-brand-primary),0.35)]
          transition-all duration-300 hover:scale-[1.04] active:scale-[0.96]
          focus:outline-none focus:ring-4 focus:ring-[rgba(var(--rgb-brand-primary),0.25)]
        "
      >
        {/* attention pulse (only when closed) */}
        {!isOpen && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[var(--color-brand-primary)] opacity-20" />
        )}

        <span className="relative h-6 w-6 sm:h-7 sm:w-7">
          <IoChatbubbleEllipses
            className={`absolute inset-0 h-full w-full transition-all duration-300 ${
              isOpen ? "scale-50 opacity-0" : "scale-100 opacity-100"
            }`}
          />
          <IoClose
            className={`absolute inset-0 h-full w-full transition-all duration-300 ${
              isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          />
        </span>

        {/* desktop hover label (opens to the right of the left-anchored button) */}
        <span
          className="
            pointer-events-none absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap
            rounded-full bg-white px-3 py-2 text-sm font-medium text-blue-900 shadow-lg ring-1 ring-black/5
            left-[calc(100%+12px)] -translate-x-2 opacity-0 transition-all duration-300
            group-hover:translate-x-0 group-hover:opacity-100 lg:block
          "
        >
          {label}
        </span>
      </button>
    </div>
  );
}
