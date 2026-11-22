/**
 * WhyLitmadSection.js
 * ─────────────────────────────────────────────────────────────────────────
 * Rebuilt to match the About page's editorial layout and animation system.
 * Mobile-first responsive pass applied throughout.
 * ─────────────────────────────────────────────────────────────────────────
 */

import Image from "next/image";
import dynamic from "next/dynamic";
import Reveal from "./Reveal";
import { headingClasses } from "../ui/Heading";

/* Dynamically import the accordion — defers Framer Motion bundle
   until the user scrolls near the benefits section */
const BenefitsRow = dynamic(() => import("./BenefitsRowClient"), {
  ssr: true,
  loading: () => <div className="h-32" />,
});

const COPY = {
  en: {
    emotionHeadline: "Wake up to comfort you feel from the very first moment.",
    emotionSub: "Deeper sleep. Lasting comfort. Better mornings.",
    trustEyebrow: "Chosen by thousands",
    certLabel: "Certified quality",
    certText: "Orthopaedic support · ISO 9001:2015",
    imageAlt: "Resting on an Empreinte Flex mattress",
    benefitsEyebrow: "Why choose it",
    benefits: [
      {
        headline: "Comfort that adapts without losing support.",
        proof:
          "Balanced layers respond to pressure points to create softness with stability.",
      },
      {
        headline: "Quality designed to last through daily use.",
        proof:
          "High-resilience materials help preserve comfort and structure over time.",
      },
      {
        headline: "A fresher feel throughout the night.",
        proof:
          "Breathable inner construction and moisture-managing fabric help improve airflow.",
      },
      {
        headline: "Less motion. Fewer sleep disruptions.",
        proof:
          "A structure designed to reduce motion transfer for a calmer shared sleep experience.",
      },
    ],
  },

  fr: {
    emotionHeadline:
      "Réveillez-vous avec un confort que vous ressentez dès le premier instant.",
    emotionSub:
      "Un sommeil plus profond. Un confort durable. De meilleurs réveils.",
    trustEyebrow: "Choisi par des milliers de clients",
    certLabel: "Qualité certifiée",
    certText: "Soutien orthopédique · ISO 9001:2015",
    imageAlt: "Repos sur un matelas Empreinte Flex",
    benefitsEyebrow: "Pourquoi la choisir",
    benefits: [
      {
        headline: "Un confort qui s’adapte sans perdre le soutien.",
        proof:
          "Des couches équilibrées qui épousent les points de pression tout en gardant une bonne tenue.",
      },
      {
        headline: "Une qualité pensée pour durer au quotidien.",
        proof:
          "Des matériaux haute résilience conçus pour conserver leur confort et leur maintien dans le temps.",
      },
      {
        headline: "Une sensation plus fraîche toute la nuit.",
        proof:
          "Une structure respirante et un tissu adapté pour favoriser une meilleure circulation de l’air.",
      },
      {
        headline: "Moins de mouvements ressentis pendant la nuit.",
        proof:
          "Une conception qui limite la transmission des mouvements pour un sommeil plus paisible à deux.",
      },
    ],
  },

  ar: {
    emotionHeadline: "استيقظ كل يوم براحة تشعر بها من أول لحظة.",
    emotionSub: "نوم أعمق. راحة تدوم. وصباح يبدأ بشكل أفضل.",
    trustEyebrow: "ثقة اختارها آلاف العملاء",
    certLabel: "جودة معتمدة",
    certText: "دعم طبي للنوم · ISO 9001:2015",
    imageAlt: "نوم هادئ على مرتبة Empreinte Flex",
    benefitsEyebrow: "لماذا تختارها",
    benefits: [
      {
        headline: "راحة تحتضن الجسم دون أن تبتلع الإحساس بالدعم.",
        proof:
          "طبقات متوازنة تتكيف مع نقاط الضغط لتمنحكم راحة مريحة وثباتاً مدروساً.",
      },
      {
        headline: "جودة تحافظ على أدائها مع الاستخدام اليومي.",
        proof: "مواد عالية المرونة مصممة لتبقى ثابتة ومريحة لسنوات طويلة.",
      },
      {
        headline: "إحساس أكثر انتعاشاً طوال الليل.",
        proof:
          "تركيبة داخلية تساعد على التهوية مع قماش يساهم في تقليل احتباس الرطوبة.",
      },
      {
        headline: "حركة أقل وإزعاج أقل أثناء النوم.",
        proof: "بنية داخلية تقلل انتقال الحركة لتمنح كل شخص راحته بشكل أفضل.",
      },
    ],
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — server component
══════════════════════════════════════════════════════════════════════════ */
export default function WhyLitmadSection({ translation, locale }) {
  const { statements, trust } = translation.home.whyLitmad;
  const T = COPY[locale] ?? COPY.en;
  const isRTL = locale === "ar";

  return (
    <section className="bg-white overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* ══════════════════════════════════════════
          ① EMOTION HERO
          Mobile: reduced vertical padding, smaller ghost text,
          tighter headline, sub-line drops to text-sm
      ══════════════════════════════════════════ */}
      <div className="relative py-16 sm:py-24 md:py-36 flex items-center justify-center text-center px-5 sm:px-8 overflow-hidden min-h-[50vh] sm:min-h-0">
        {/* Ghost word — clamped so it never overflows on 320px screens */}
        <Reveal
          as="div"
          className="absolute inset-0 flex items-center justify-center pointer-events-none reveal-ghost"
          delay={0}
        >
          <span
            className="select-none whitespace-nowrap font-semibold tracking-tight text-blue-900 opacity-[0.04]"
            style={{ fontSize: "clamp(48px, 18vw, 200px)" }}
          >
            Empreinte Flex
          </span>
        </Reveal>

        <div className="relative max-w-2xl w-full">
          {/* Eyebrow — smaller tracking on mobile to avoid overflow */}
          <Reveal
            as="p"
            className="reveal-badge mb-4 text-[10px] uppercase tracking-[0.35em] text-blue-900 sm:mb-6 sm:text-xs sm:tracking-[0.5em]"
            delay={80}
          >
            {T.trustEyebrow}
          </Reveal>

          {/* Emotion headline — uses Heading h1 scale (already responsive) */}
          <Reveal
            as="h2"
            className={`${headingClasses({ size: "h1", color: "default" })} reveal-block`}
            delay={200}
          >
            {T.emotionHeadline}
          </Reveal>

          {/* Sub-line */}
          <Reveal
            as="p"
            className="mt-3 sm:mt-5 text-sm sm:text-base text-slate-400 italic leading-relaxed reveal-block"
            delay={340}
          >
            {T.emotionSub}
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ② FULL-BLEED IMAGE FRAME
          Mobile: shorter height (55vw min), text block
          uses smaller font and tighter spacing,
          cert strip hides on very small screens
      ══════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{ height: "clamp(260px, 70vw, 85vh)" }}
      >
        <Reveal
          as="div"
          className="absolute inset-0 reveal-frame-image"
          delay={0}
        >
          <Image
            src="/images/about-1.png"
            alt={T.imageAlt}
            fill
            className="object-cover object-center"
            sizes="100vw"
            quality={80}
            priority
          />
        </Reveal>

        {/* Gradient — stronger at bottom for mobile readability */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/50 to-transparent" />

        {/* Text block — pinned to bottom, safe padding on mobile */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-7 sm:pb-14 md:pb-24 text-center text-white">
          {/* Cert strip — hidden on xs to save space */}
          <Reveal
            as="p"
            className="reveal-badge mb-3 hidden text-[10px] uppercase tracking-[0.4em] text-blue-200/70 xs:block sm:mb-4 sm:text-xs"
            delay={200}
          >
            {T.certLabel} · {T.certText}
          </Reveal>

          <Reveal
            as="h3"
            className={`${headingClasses({ size: "h2", color: "white" })} reveal-block`}
            delay={300}
          >
            {statements?.[0]?.title ?? "Engineered for real sleep."}
          </Reveal>

          {/* Desc hidden on mobile — too much text over image */}
          <Reveal
            as="p"
            className=" mt-4 sm:mt-6 text-sm sm:text-base text-white/80 leading-relaxed reveal-block max-w-xl mx-auto"
            delay={450}
          >
            {statements?.[0]?.desc ?? ""}
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ③ EDITORIAL — text left, image right
          Mobile: stacked (single column), image below text,
          tighter vertical spacing, image full-width rounded
      ══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6 md:px-8 py-14 sm:py-20 md:py-36">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 md:gap-20 items-center">
          {/* TEXT — full width on mobile */}
          <div className="space-y-5 sm:space-y-8">
            <Reveal
              as="h3"
              className={`${headingClasses({ size: "h2", color: "default" })} reveal-from-left`}
              delay={0}
            >
              {statements?.[1]?.title ?? "Precision at every layer."}
            </Reveal>

            <Reveal
              as="p"
              className="reveal-from-left text-sm leading-relaxed text-blue-900 sm:text-base md:text-lg"
              delay={120}
            >
              {statements?.[1]?.desc ?? ""}
            </Reveal>

            {/* Third statement desc — hidden on mobile to keep it tight */}
            <Reveal
              as="p"
              className="hidden sm:block text-sm sm:text-base text-slate-500 leading-relaxed reveal-from-left"
              delay={220}
            >
              {statements?.[2]?.desc ?? ""}
            </Reveal>

            {/* Trust stats — 3-col on mobile, horizontal scroll fallback */}
            <Reveal as="div" className="reveal-from-left" delay={300}>
              <div className="flex flex-wrap gap-6 sm:gap-8 pt-1">
                {trust?.slice(0, 3).map(({ value, label }, i) => (
                  <div key={i} className="min-w-0">
                    <p className="text-xl font-semibold leading-none tracking-tight text-blue-900 sm:text-2xl md:text-3xl">
                      {value}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.3em] sm:tracking-[0.35em] text-slate-400 mt-1 leading-snug">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* IMAGE — full width on mobile, natural aspect ratio */}
          <Reveal as="div" className="w-full reveal-image" delay={180}>
            <div className="relative w-full aspect-[4/3] rounded-md sm:rounded-md overflow-hidden">
              <Image
                src="/images/about-2.jpg"
                alt={T.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={75}
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ④ COMMITMENT — centred on tinted bg
          Mobile: reduced padding, smaller ghost word,
          paragraphs tighten up nicely with space-y
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-blue-50 py-16 sm:py-24 md:py-40">
        {/* Ghost word — fluid size so it doesn't overflow on 320px */}
        <Reveal
          as="div"
          className="absolute inset-0 flex items-center justify-center pointer-events-none reveal-ghost"
          delay={0}
        >
          <span
            className="select-none font-semibold tracking-tight text-blue-900 opacity-[0.05]"
            style={{ fontSize: "clamp(60px, 25vw, 200px)" }}
          >
            {locale === "ar" ? "نوم" : locale === "fr" ? "Sommeil" : "Sleep"}
          </span>
        </Reveal>

        <div className="relative max-w-lg sm:max-w-2xl md:max-w-3xl mx-auto text-center px-5 sm:px-6 md:px-8 space-y-6 sm:space-y-10">
          <Reveal
            as="h3"
            className={`${headingClasses({ size: "h1", color: "default" })} reveal-block`}
            delay={120}
          >
            {statements?.[2]?.title ?? "Your best sleep. Every night."}
          </Reveal>

          <Reveal
            as="p"
            className="text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed reveal-block"
            delay={260}
          >
            {statements?.[1]?.desc ?? ""}
          </Reveal>

          {/* Second paragraph hidden on mobile — keeps the section punchy */}
          <Reveal
            as="p"
            className="hidden sm:block text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed reveal-block"
            delay={380}
          >
            {statements?.[0]?.desc ?? ""}
          </Reveal>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ⑤ BENEFITS ACCORDION
          Mobile: tighter horizontal padding,
          BenefitsRowClient handles its own mobile layout
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <BenefitsRow locale={locale} T={T} isRTL={isRTL} />
      </div>
    </section>
  );
}
