"use client";

import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiInstagram,
  FiFacebook,
  FiCode,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import EmpreinteReveal from "../ui/EmpreinteReveal";

/* Single set of variants — no per-item useInView */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const socialLinks = {
  instagram: "https://www.instagram.com/empreinte_flex/",
  facebook: "https://www.facebook.com/profile.php?id=61564340797984",
  whatsapp:
    "https://wa.me/213781404474?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20vos%20matelas",
};

export default function Footer({ translation }) {
  const params = useParams();
  const locale = params?.local || "en";
  const router = useRouter();

  const isRTL = locale === "ar";

  /* ONE useInView for the entire footer — performant */
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.1 });

  const {
    footer: {
      brandDescription,
      shop: shopLinks,
      company: companyLinks,
      contact: contactInfo,
      bottom: bottomInfo,
    },
  } = translation;

  return (
    <footer
      dir="ltr"
      ref={footerRef}
      className="relative overflow-hidden border-t border-[rgba(var(--rgb-brand-border),0.55)] bg-[var(--color-surface-base)] text-[var(--color-text-primary)]"
      id="site-footer"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-danger)]/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-48 h-[30rem] w-[30rem] rounded-full border border-[rgba(var(--rgb-brand-border),0.2)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 h-[22rem] w-[22rem] rounded-full border border-[rgba(var(--rgb-brand-border),0.2)]"
      />
      {/* ================= MAIN ================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16 lg:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr] lg:gap-16"
        >
          {/* ===== BRAND ===== */}
          <motion.div
            variants={fadeUp}
            className="cursor-pointer space-y-5 lg:border-e lg:border-[rgba(var(--rgb-brand-border),0.55)] lg:pe-12"
            onClick={() => router.push(`/${locale}`)}
          >
            <div className="flex h-14 w-auto items-center sm:h-16">
              <div
                className="h-full"
                style={{ aspectRatio: "855.25 / 511.29" }}
              >
                {isInView && <EmpreinteReveal />}
              </div>
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
              {brandDescription}
            </p>

            <div className="flex items-center gap-2 border-t border-[rgba(var(--rgb-brand-border),0.45)] pt-4">
              <SocialIcon href={socialLinks.instagram}>
                <FiInstagram size={17} />
              </SocialIcon>
              <SocialIcon href={socialLinks.facebook}>
                <FiFacebook size={17} />
              </SocialIcon>
              <SocialIcon href={socialLinks.whatsapp}>
                <FaWhatsapp size={17} />
              </SocialIcon>
            </div>
          </motion.div>

          {/* ===== SHOP ===== */}
          <motion.div variants={fadeUp}>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-primary)] sm:mb-6 sm:text-sm">
              {shopLinks.title}
            </h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-secondary)] sm:space-y-4 sm:text-base">
              <FooterLink href={`/${locale}/mattresses`}>
                {shopLinks.allMattresses}
              </FooterLink>
              <FooterLink href={`/${locale}#collections`}>
                {shopLinks.collections}
              </FooterLink>
              <FooterLink href={`/${locale}/track-order`}>
                {shopLinks.trackOrder}
              </FooterLink>
            </ul>
          </motion.div>

          {/* ===== COMPANY ===== */}
          <motion.div variants={fadeUp}>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-primary)] sm:mb-6 sm:text-sm">
              {companyLinks.title}
            </h4>
            <ul className="space-y-3 text-sm text-[var(--color-text-secondary)] sm:space-y-4 sm:text-base">
              <FooterLink href={`/${locale}`}>{companyLinks.home}</FooterLink>
              <FooterLink href={`/${locale}/about`}>
                {companyLinks.about}
              </FooterLink>
              <FooterLink href={`/${locale}/contact`}>
                {companyLinks.contact}
              </FooterLink>
            </ul>
          </motion.div>

          {/* ===== CONTACT ===== */}
          <motion.div variants={fadeUp}>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-primary)] sm:mb-6 sm:text-sm">
              {contactInfo.title}
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <ContactItem icon={<FiPhone />} text={contactInfo.phone} />
              <ContactItem icon={<FiMail />} text={contactInfo.email} />
              <ContactItem icon={<FiMapPin />} text={contactInfo.location} />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ================= BOTTOM STRIP ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 border-t border-white/10 bg-[var(--color-brand-deep)] text-white"
      >
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs sm:flex-row sm:px-8 sm:py-6 sm:text-sm"
        >
          <p
            className={`text-center text-white/60 ${
              isRTL ? "sm:text-right" : "sm:text-left"
            }`}
          >
            © {new Date().getFullYear()} Empreinte Flex. {bottomInfo.copyright}
          </p>

          <a
            href="mailto:mehdibch.dev@gmail.com"
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
          >
            <FiCode
              size={14}
              className="text-white/40 group-hover:text-white transition-colors duration-300"
            />
            <span>
              {bottomInfo.developedBy}{" "}
              <span
                dir="ltr"
                className="font-medium text-white/90 group-hover:text-white"
              >
                Mehdi Bouchachi
              </span>
            </span>
          </a>
        </div>
      </motion.div>
    </footer>
  );
}

/* ================= SUB COMPONENTS ================= */

function FooterLink({ href, children }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-[var(--color-text-secondary)] transition-colors duration-200 hover:text-[var(--color-brand-primary)]"
      >
        {children}
        <span
          aria-hidden="true"
          className="text-[var(--color-brand-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          →
        </span>
      </Link>
    </li>
  );
}

function ContactItem({ icon, text }) {
  return (
    <div className="group flex items-start gap-3 text-sm sm:text-base">
      <span className="mt-1 shrink-0 text-[var(--color-brand-primary)] transition-transform duration-200 group-hover:translate-x-0.5">
        {icon}
      </span>
      <span className="text-[var(--color-text-secondary)]">{text}</span>
    </div>
  );
}

function SocialIcon({ children, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        w-9 h-9 sm:w-10 sm:h-10
        rounded-md border border-[rgba(var(--rgb-brand-border),0.6)] bg-[var(--color-surface-panel)]
        flex items-center justify-center
        text-[var(--color-brand-primary)]
        hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-surface-soft)]
        transition-colors duration-200
        cursor-pointer
      "
    >
      {children}
    </a>
  );
}
