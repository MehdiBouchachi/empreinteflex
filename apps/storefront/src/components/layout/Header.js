"use client";

import { useSelector } from "react-redux";
import { selectCartCount } from "@/store/slices/cartSlice";
import { usePathname } from "next/navigation";
import { useState, memo } from "react";
import {
  FiShoppingCart,
  FiChevronDown,
  FiMenu,
  FiX,
  FiHome,
  FiGrid,
  FiTruck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Button from "../ui/Button";
import EmpreinteReveal from "../ui/EmpreinteReveal";
import { useScrollChromeVisibility } from "./ScrollChromeProvider";

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
];

export default function Header({ translation }) {
  const count = useSelector(selectCartCount);
  const pathname = usePathname();
  const { headerVisible, mobileNavVisible, isNearTop } =
    useScrollChromeVisibility();

  const locale = pathname.split("/")[1] || "en";
  const isRTL = locale === "ar";

  const [openLang, setOpenLang] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobileLang, setOpenMobileLang] = useState(false);

  const {
    header: { shopNow, menu, navigation, language, bottomNav, aria },
  } = translation || {};

  const isActive = (path) => pathname.includes(path);

  const switchLocalePath = (lng) => {
    const segments = pathname.split("/");
    segments[1] = lng;
    return segments.join("/");
  };

  const cartAriaLabel =
    count > 0
      ? (aria?.cartCount ?? "{{count}} items in cart").replace(
          "{{count}}",
          count,
        )
      : (aria?.cart ?? "Shopping cart");

  const cartTooltipLabel =
    aria?.goToCart ??
    (locale === "fr"
      ? "Aller au panier"
      : locale === "ar"
        ? "الذهاب إلى السلة"
        : "Go to cart");

  const headerItems = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.1 + i * 0.08,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  const langDropdown = {
    hidden: { opacity: 0, y: -8, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } },
  };

  const drawerOverlay = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const drawerPanel = {
    hidden: { x: isRTL ? "100%" : "-100%" },
    visible: {
      x: 0,
      transition: { type: "spring", damping: 28, stiffness: 300 },
    },
    exit: {
      x: isRTL ? "100%" : "-100%",
      transition: { duration: 0.25, ease: "easeIn" },
    },
  };

  const drawerItem = {
    hidden: { opacity: 0, x: isRTL ? 20 : -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, delay: 0.15 + i * 0.06, ease: "easeOut" },
    }),
  };

  return (
    <>
      <motion.header
        dir="ltr"
        initial={{ y: -100 }}
        animate={{ y: headerVisible ? 0 : -110 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 left-0 w-full z-50
          transition-all duration-500
          ${
            isNearTop
              ? "bg-transparent border-transparent"
              : "bg-white/90 backdrop-blur-xl border-b border-blue-200 shadow-sm"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between">
          <motion.div
            custom={0}
            variants={headerItems}
            initial="hidden"
            animate="visible"
          >
            <Link
              href={`/${locale}`}
              aria-label={aria?.logo ?? "Empreinte Flex — go to homepage"}
            >
              <motion.div
                className="cursor-pointer h-14 lg:h-16 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div
                  className="h-full"
                  style={{ aspectRatio: "855.25 / 511.29" }}
                >
                  <EmpreinteReveal />
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            <motion.div
              custom={1}
              variants={headerItems}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={`/${locale}/track-order`}
                className="relative text-sm transition group text-slate-600 hover:text-slate-900"
              >
                {navigation.trackOrder}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-blue-900/40 transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>

            <motion.div
              custom={2}
              variants={headerItems}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpenLang(!openLang)}
                aria-haspopup="listbox"
                aria-expanded={openLang}
                aria-label={(
                  aria?.currentLang ?? "Current language: {{lang}}"
                ).replace(
                  "{{lang}}",
                  languages.find((l) => l.code === locale)?.label ?? locale,
                )}
                className="flex items-center gap-2 rounded-md border border-blue-900/30 px-4 py-2 text-sm text-slate-600 transition hover:bg-blue-50/10"
              >
                {languages.find((l) => l.code === locale)?.label}
                <motion.span
                  animate={{ rotate: openLang ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  aria-hidden="true"
                >
                  <FiChevronDown />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {openLang && (
                  <motion.ul
                    role="listbox"
                    aria-label={aria?.selectLang ?? "Select language"}
                    variants={langDropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-blue-200 bg-white shadow-lg"
                  >
                    {languages.map((lng, i) => (
                      <motion.li
                        key={lng.code}
                        role="option"
                        aria-selected={locale === lng.code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                      >
                        <Link
                          onClick={() => setOpenLang(false)}
                          href={switchLocalePath(lng.code)}
                          aria-current={
                            locale === lng.code ? "true" : undefined
                          }
                          aria-label={
                            locale === lng.code
                              ? (
                                  aria?.currentLang ??
                                  "Current language: {{lang}}"
                                ).replace("{{lang}}", lng.label)
                              : (
                                  aria?.switchTo ?? "Switch to {{lang}}"
                                ).replace("{{lang}}", lng.label)
                          }
                          className={`block px-4 py-3 text-sm transition-colors duration-200 ${
                            locale === lng.code
                              ? "bg-blue-50 font-medium text-blue-900"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          {lng.label}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              custom={3}
              variants={headerItems}
              initial="hidden"
              animate="visible"
            >
              <Link href={`/${locale}/mattresses`} aria-label={shopNow}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="sm" variant="primary">
                    {shopNow}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              custom={4}
              variants={headerItems}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={`/${locale}/cart`}
                aria-label={cartAriaLabel}
                className="group relative inline-flex"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="relative"
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="relative border-blue-900/20 p-3 hover:border-blue-900/35 hover:bg-blue-50/60"
                  >
                    <FiShoppingCart className="text-lg" aria-hidden="true" />

                    <AnimatePresence>
                      {count > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 20,
                          }}
                          aria-hidden="true"
                          className="absolute -top-2 -right-2 rounded-full bg-blue-900 px-2 py-0.5 text-[10px] text-white shadow-[0_8px_20px_rgba(var(--rgb-brand-primary),0.22)]"
                        >
                          {count}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>

                  <span
                    role="tooltip"
                    className="
                      pointer-events-none absolute left-1/2 top-full z-20 mt-3
                      -translate-x-1/2 translate-y-1 whitespace-nowrap
                      rounded-md border border-blue-200
                      bg-white/95 px-3 py-2
                      text-[11px] font-medium text-blue-900
                      shadow-[0_12px_30px_rgba(var(--rgb-brand-primary),0.12)]
                      backdrop-blur-md
                      opacity-0 transition-all duration-200
                      group-hover:translate-y-0 group-hover:opacity-100
                      group-focus-visible:translate-y-0 group-focus-visible:opacity-100
                    "
                  >
                    {cartTooltipLabel}
                    <span
                      aria-hidden="true"
                      className="
                        absolute left-1/2 top-0 h-2.5 w-2.5
                        -translate-x-1/2 -translate-y-1/2 rotate-45
                        border-l border-t border-blue-200
                        bg-white
                      "
                    />
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Language Switcher */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenMobileLang((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={openMobileLang}
                aria-label={(
                  aria?.currentLang ?? "Current language: {{lang}}"
                ).replace(
                  "{{lang}}",
                  languages.find((l) => l.code === locale)?.label ?? locale,
                )}
                className="px-3 py-2 text-xs rounded-md border border-blue-200 text-slate-600 hover:bg-blue-50 transition flex items-center gap-1"
              >
                {locale.toUpperCase()}
                <motion.span
                  animate={{ rotate: openMobileLang ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden="true"
                >
                  <FiChevronDown size={12} />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {openMobileLang && (
                  <motion.ul
                    role="listbox"
                    aria-label={aria?.selectLang ?? "Select language"}
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.18, ease: "easeOut" },
                    }}
                    exit={{
                      opacity: 0,
                      y: -6,
                      scale: 0.95,
                      transition: { duration: 0.13 },
                    }}
                    className="absolute right-0 mt-2 w-36 overflow-hidden rounded-md border border-blue-200 bg-white shadow-lg z-50"
                  >
                    {languages.map((lng) => (
                      <li
                        key={lng.code}
                        role="option"
                        aria-selected={locale === lng.code}
                      >
                        <Link
                          href={switchLocalePath(lng.code)}
                          onClick={() => setOpenMobileLang(false)}
                          aria-current={
                            locale === lng.code ? "true" : undefined
                          }
                          aria-label={
                            locale === lng.code
                              ? (
                                  aria?.currentLang ??
                                  "Current language: {{lang}}"
                                ).replace("{{lang}}", lng.label)
                              : (
                                  aria?.switchTo ?? "Switch to {{lang}}"
                                ).replace("{{lang}}", lng.label)
                          }
                          className={`block px-4 py-2.5 text-sm transition-colors duration-200 ${
                            locale === lng.code
                              ? "bg-blue-50 font-medium text-blue-900"
                              : "text-slate-600 hover:bg-blue-50"
                          }`}
                        >
                          {lng.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              custom={1}
              variants={headerItems}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 90 }}
              aria-label={aria?.openMenu ?? "Open navigation menu"}
              aria-expanded={openMenu}
              aria-controls="mobile-drawer"
              className="w-10 h-10 rounded-md border flex items-center justify-center border-slate-200 text-slate-600"
              onClick={() => setOpenMenu(true)}
            >
              <FiMenu size={20} aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {openMenu && (
          <div
            id="mobile-drawer"
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={menu}
          >
            <motion.div
              variants={drawerOverlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpenMenu(false)}
              aria-hidden="true"
            />

            <motion.div
              variants={drawerPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              dir={isRTL ? "rtl" : "ltr"}
              className={`absolute top-0 h-full w-72 bg-white shadow-2xl p-6 ${
                isRTL ? "right-0" : "left-0"
              }`}
            >
              <div className="flex justify-between items-center mb-8">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-semibold text-lg"
                >
                  {menu}
                </motion.span>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpenMenu(false)}
                  aria-label={aria?.closeMenu ?? "Close navigation menu"}
                >
                  <FiX size={22} aria-hidden="true" />
                </motion.button>
              </div>

              <nav aria-label={menu}>
                <ul className="flex flex-col gap-6 text-base mb-10 list-none">
                  {[
                    {
                      href: `/${locale}`,
                      active: pathname === `/${locale}`,
                      label: navigation.home,
                    },
                    {
                      href: `/${locale}/mattresses`,
                      active: pathname.includes("mattresses"),
                      label: navigation.collection,
                    },
                    {
                      href: `/${locale}/about`,
                      active: pathname.includes("about"),
                      label: navigation.about,
                    },
                    {
                      href: `/${locale}/contact`,
                      active: pathname.includes("contact"),
                      label: navigation.contact,
                    },
                    {
                      href: `/${locale}/track-order`,
                      active: pathname.includes("track-order"),
                      label: navigation.trackOrder,
                    },
                  ].map((item, i) => (
                    <motion.li
                      key={item.href}
                      custom={i}
                      variants={drawerItem}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMenu(false)}
                        aria-current={item.active ? "page" : undefined}
                        className={`relative text-base transition-colors duration-200 group ${
                          item.active
                            ? "font-medium text-blue-900"
                            : "text-slate-600 hover:text-blue-900"
                        }`}
                      >
                        <span className="relative">
                          {item.label}
                          {item.active && (
                            <motion.span
                              layoutId="drawer-active"
                              className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-blue-900"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-auto border-t border-blue-200 pt-6"
              >
                <p
                  className="text-xs mb-4 text-slate-500"
                  id="drawer-lang-label"
                >
                  {language}
                </p>

                <ul
                  role="listbox"
                  aria-labelledby="drawer-lang-label"
                  className="flex flex-col gap-3 list-none"
                >
                  {languages.map((lng, i) => (
                    <motion.li
                      key={lng.code}
                      role="option"
                      aria-selected={locale === lng.code}
                      initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.07, duration: 0.3 }}
                    >
                      <Link
                        href={switchLocalePath(lng.code)}
                        onClick={() => setOpenMenu(false)}
                        aria-current={locale === lng.code ? "true" : undefined}
                        aria-label={
                          locale === lng.code
                            ? (
                                aria?.currentLang ??
                                "Current language: {{lang}}"
                              ).replace("{{lang}}", lng.label)
                            : (aria?.switchTo ?? "Switch to {{lang}}").replace(
                                "{{lang}}",
                                lng.label,
                              )
                        }
                        className={`block text-sm px-3 py-2 rounded-md transition-colors duration-200 ${
                          locale === lng.code
                            ? "bg-blue-50 font-medium text-blue-900"
                            : "hover:bg-blue-50"
                        }`}
                      >
                        {lng.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        dir={isRTL ? "rtl" : "ltr"}
        initial={{ y: 100 }}
        animate={{ y: mobileNavVisible ? 0 : 96 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-0 left-0 z-40 w-full border-t border-blue-200 bg-white/90 backdrop-blur-xl md:hidden"
      >
        <nav aria-label={bottomNav?.navLabel ?? "Main navigation"}>
          <div className="flex justify-around py-2">
            <NavItem
              active={pathname === `/${locale}`}
              icon={<FiHome />}
              label={bottomNav.home}
              href={`/${locale}`}
            />
            <NavItem
              active={isActive("mattresses")}
              icon={<FiGrid />}
              label={bottomNav.shop}
              href={`/${locale}/mattresses`}
            />
            <NavItem
              active={isActive("track-order")}
              icon={<FiTruck />}
              label={bottomNav.track}
              href={`/${locale}/track-order`}
            />
            <NavItem
              active={isActive("cart")}
              icon={<FiShoppingCart />}
              label={bottomNav.cart}
              href={`/${locale}/cart`}
              badge={count}
              badgeAriaLabel={
                count > 0
                  ? (aria?.cartCount ?? "{{count}} items in cart").replace(
                      "{{count}}",
                      count,
                    )
                  : undefined
              }
            />
          </div>
        </nav>
      </motion.div>
    </>
  );
}

const NavItem = memo(function NavItem({
  icon,
  label,
  href,
  badge,
  active,
  badgeAriaLabel,
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={badgeAriaLabel ? `${label}, ${badgeAriaLabel}` : label}
      className="flex flex-col items-center text-xs relative active:scale-95 transition"
    >
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
          active ? "bg-blue-900 text-white shadow-md" : "text-slate-600"
        }`}
      >
        <motion.div
          animate={active ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.4 }}
          aria-hidden="true"
        >
          {icon}
        </motion.div>

        <AnimatePresence>
          {badge > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              aria-hidden="true"
              className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1.5 rounded-full"
            >
              {badge}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <span
        aria-hidden="true"
        className={`mt-1 transition-colors duration-200 ${
          active ? "font-medium text-blue-900" : "text-slate-600"
        }`}
      >
        {label}
      </span>
    </Link>
  );
});
