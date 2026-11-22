/**
 * page.js — Contact Page
 *
 * Structure (mobile-first, deliberately simple — no gradients, no shadows):
 *   1. Hero      — eyebrow + headline + description
 *   2. Channels  — WhatsApp · Call · Email (tappable cards)
 *   3. Form      — message form + working hours
 */

import { FiPhone, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { getTranslations } from "@/lib/i18n";
import ContactForm from "./ContactForm";
import HeroReveal from "./HeroReveal";
import CardReveal from "./CardReveal";
import InfoReveal from "./InfoReveal";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/* ── Contact constants ── */
const WHATSAPP_NUMBER = "213781404474";
const PHONE_INTL = "+213781404474";

const WHATSAPP_MESSAGE = {
  fr: "Bonjour, je souhaite avoir plus d'informations sur vos matelas Empreinte Flex.",
  en: "Hello, I would like more information about your Empreinte Flex mattresses.",
  ar: "مرحبًا، أود الحصول على مزيد من المعلومات حول مراتب Empreinte Flex.",
};

export default async function ContactPage({ params }) {
  const { local } = await params;

  const {
    contactPage: { hero, channels, form, info },
    footer: {
      contact: { phone, email },
    },
  } = getTranslations(local);

  const contact = { phone, email };

  return (
    <main dir={local === "ar" ? "rtl" : "ltr"} className="bg-white">
      <ContactHero hero={hero} />

      <section className="pb-6 sm:pb-8">
        <div className="mx-auto grid max-w-6xl items-start gap-4 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.4fr] lg:gap-6 lg:px-8">
          <aside className="rounded-md bg-blue-950 p-4 text-white sm:p-6">
          <QuickChannels
            locale={local}
            channels={channels}
            contact={contact}
          />
            <div className="mt-2 border-t border-white/15 pt-2 sm:mt-4 sm:pt-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white">{info.hours}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{info.hoursValue}</p>
            </div>
          </aside>

          <div>
            <ContactCard locale={local} form={form} />
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   HERO SECTION
========================================================= */

function ContactHero({ hero }) {
  return (
    <section className="pt-20 pb-3 sm:pt-28 sm:pb-6">
      <HeroReveal>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <span aria-hidden="true" className="mb-3 hidden h-px sm:block w-10 bg-red-600" />
          <p
            className="contact-hero-reveal mb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-red-600"
            style={{ transitionDelay: "0ms" }}
          >
            {hero.badge ?? "Contact"}
          </p>

          <h1
            className="contact-hero-reveal mb-3 text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl lg:text-4xl"
            style={{ transitionDelay: "120ms" }}
          >
            {hero.title}
          </h1>

          <p
            className="contact-hero-reveal max-w-2xl text-sm leading-relaxed text-blue-950/70 sm:text-base"
            style={{ transitionDelay: "240ms" }}
          >
            {hero.description}
          </p>
        </div>
      </HeroReveal>
    </section>
  );
}

/* =========================================================
   QUICK CHANNELS — WhatsApp · Call · Email
========================================================= */

function QuickChannels({ locale, channels, contact }) {
  const waMessage = WHATSAPP_MESSAGE[locale] || WHATSAPP_MESSAGE.fr;
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  return (
    <InfoReveal>
      <div className="mb-3 hidden sm:block">
        <h2 className="contact-stagger text-base font-semibold tracking-tight text-white sm:text-xl">
          {channels.title}
        </h2>
        <p
          className="contact-stagger hidden sm:block mt-2 max-w-md text-sm leading-relaxed text-white/70"
          style={{ "--stagger-delay": "60ms" }}
        >
          {channels.description}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-0 sm:divide-y sm:divide-white/15">
        <ChannelCard
          icon={<FaWhatsapp />}
          label={channels.whatsapp}
          value={contact.phone}
          href={whatsappHref}
          external
          ltrValue
          delay="120ms"
        />
        <ChannelCard
          icon={<FiPhone />}
          label={channels.call}
          value={contact.phone}
          href={`tel:${PHONE_INTL}`}
          ltrValue
          delay="180ms"
        />
        <ChannelCard
          icon={<FiMail />}
          label={channels.email}
          value={contact.email}
          href={`mailto:${contact.email}`}
          ltrValue
          delay="240ms"
        />
      </div>
    </InfoReveal>
  );
}

function ChannelCard({
  icon,
  label,
  value,
  href,
  external,
  ltrValue,
  delay,
}) {
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      {...linkProps}
      className="
        contact-stagger group flex flex-col sm:flex-row items-center gap-2 sm:gap-3 rounded-md
        px-1 py-2.5 text-center sm:text-start
        transition-colors duration-300
        hover:bg-white/5
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
      "
      style={{ "--stagger-delay": delay }}
    >
      <span
        className="
          flex h-8 w-8 shrink-0 items-center justify-center rounded-md
          bg-white/5 text-[19px] text-white
        "
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="min-w-0 max-w-full">
        <span className="block text-sm font-medium text-white">
          {label}
        </span>
        <span
          className="mt-1 hidden sm:block break-all text-xs leading-relaxed text-white/65"
          dir={ltrValue ? "ltr" : undefined}
        >
          {value}
        </span>
      </span>
    </a>
  );
}

/* =========================================================
   FORM CARD
========================================================= */

function ContactCard({ locale, form }) {
  const isRTL = locale === "ar";

  return (
    <CardReveal>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="
          rounded-md sm:rounded-md
          border border-blue-900/15 bg-white
          p-4 sm:p-6
        "
      >
        <ContactForm form={form} />

      </div>
    </CardReveal>
  );
}
