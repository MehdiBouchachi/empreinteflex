"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import {
  CHROME_OFFSETS,
  useScrollChromeVisibility,
} from "@/components/layout/ScrollChromeProvider";

function getWhatsAppContent(local) {
  const content = {
    fr: {
      label: "Nous contacter sur WhatsApp",
      message:
        "Bonjour, je souhaite avoir plus d'informations sur vos matelas Empreinte Flex.",
    },
    en: {
      label: "Contact us on WhatsApp",
      message:
        "Hello, I would like more information about your Empreinte Flex mattresses.",
    },
    ar: {
      label: "تواصل معنا عبر واتساب",
      message:
        "مرحبًا، أود الحصول على مزيد من المعلومات حول مراتب Empreinte Flex.",
    },
  };

  return content[local] || content.fr;
}

function normalizePhone(phone = "") {
  return String(phone).replace(/[^\d]/g, "");
}

function isMattressListingPage(pathname = "") {
  return (
    pathname.includes("/mattresses") ||
    pathname.includes("/mattresses-algeria") ||
    pathname.includes("/matelas-algerie")
  );
}

export default function WhatsAppFloatingButton({ local = "fr" }) {
  const pathname = usePathname();
  const { isMobileViewport, floatingMobileBaseOffset, isFooterInView } =
    useScrollChromeVisibility();

  const WHATSAPP_NUMBER = "213781404474";

  const { label, message } = getWhatsAppContent(local);
  const phone = normalizePhone(WHATSAPP_NUMBER);

  const isMattressPage = isMattressListingPage(pathname);

  if (!phone) return null;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const filtersClearance =
    CHROME_OFFSETS.filtersFabHeight + CHROME_OFFSETS.floatingStackGap;

  const mobileBottomOffset =
    floatingMobileBaseOffset + (isMattressPage ? filtersClearance : 0);
  const hideOnMobileFooter = isMobileViewport && isFooterInView;

  const positionClass = isMattressPage
    ? `
      fixed z-30
      right-3
      sm:right-4
      md:right-6 md:bottom-18
      
    `
    : `
      fixed z-30
      right-3
      sm:right-4
      md:right-6 md:bottom-6
     
    `;

  return (
    <div
      className={`${positionClass} transition-[bottom,transform,opacity] duration-300 ease-out ${hideOnMobileFooter ? "pointer-events-none opacity-0 translate-y-2" : "opacity-100"}`}
      style={
        isMobileViewport ? { bottom: `${mobileBottomOffset}px` } : undefined
      }
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className="
          group relative flex items-center justify-center
          h-13 w-13 sm:h-14 sm:w-14 rounded-md
          bg-[var(--color-whatsapp)] text-white
          shadow-sm
          transition-all duration-300
          hover:scale-[1.04]
          active:scale-[0.96]
          focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900
        "
      >
        <FaWhatsapp className="h-6 w-6 sm:h-7 sm:w-7" />

        <span
          className="
            pointer-events-none absolute top-1/2 hidden
            -translate-y-1/2 whitespace-nowrap rounded-md
            bg-white px-3 py-2 text-sm font-medium text-blue-900
            shadow-lg ring-1 ring-black/5
            opacity-0 transition-all duration-300
            right-[calc(100%+12px)] translate-x-2
            group-hover:opacity-100 group-hover:translate-x-0
            lg:block
           
          "
        >
          {label}
        </span>
      </Link>
    </div>
  );
}
