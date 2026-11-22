import { getTranslations } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/seo";
import Image from "next/image";
import Reveal from "./Reveal";
import ShopLocationSection from "@/components/sections/ShopLocationSection";

export async function generateMetadata({ params }) {
  const { local = "fr" } = await params;

  const titleByLocale = {
    fr: "À Propos | Empreinte Flex",
    en: "About Us | Empreinte Flex",
    ar: "من نحن | Empreinte Flex",
  };

  const descriptionByLocale = {
    fr: "Découvrez l'histoire, les engagements et le savoir-faire Empreinte Flex en Algérie.",
    en: "Discover Empreinte Flex story, commitments, and mattress expertise in Algeria.",
    ar: "تعرف على قصة Empreinte Flex والتزاماتها وخبرتها في صناعة المراتب في الجزائر.",
  };

  return buildLocalizedMetadata({
    locale: local,
    title: titleByLocale[local] || titleByLocale.fr,
    description: descriptionByLocale[local] || descriptionByLocale.fr,
    pathByLocale: { fr: "/fr/about", en: "/en/about", ar: "/ar/about" },
    robots: { index: true, follow: true },
  });
}

const mediaRoot = "/images/new%20mattress";

const gallery = [
  {
    name: "D36",
    image: `${mediaRoot}/D36%20(1).jpeg`,
    detail: `${mediaRoot}/D36%20(2).jpeg`,
    video: `${mediaRoot}/HRD45%20(1).MOV`,
  },
  {
    name: "Prestige",
    image: `${mediaRoot}/prestige%20(1).jpeg`,
    detail: `${mediaRoot}/prestige%20(3).jpeg`,
    video: `${mediaRoot}/perstige.MOV`,
  },
  {
    name: "Viscoflex",
    image: `${mediaRoot}/viscoflex%20(1).jpeg`,
    detail: `${mediaRoot}/viscoflex%20(4).jpeg`,
    video: `${mediaRoot}/viscoflex.MOV`,
  },
  {
    name: "Viscoconfort",
    image: `${mediaRoot}/viscoconfort%20(1).jpeg`,
    detail: `${mediaRoot}/viscoconfort%20(2).jpeg`,
  },
];

function MediaImage({ src, alt, className = "" }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 50vw, 100vw"
      className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${className}`}
    />
  );
}

export default async function AboutPage({ params }) {
  const { local = "en" } = await params;
  const { aboutPage } = getTranslations(local);
  const { hero, editorial, commitment, craft, locations } = aboutPage;

  return (
    <main dir={local === "ar" ? "rtl" : "ltr"} className="overflow-hidden bg-white">
      <section className="relative isolate overflow-hidden border-b border-blue-100 bg-white px-5 pb-9 pt-24 text-blue-950 sm:px-10 sm:pb-20 lg:px-16 lg:pb-24 lg:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-6 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="relative z-10">
            <Reveal as="p" className="mb-3 sm:mb-5 text-[11px] font-medium uppercase tracking-[0.16em] sm:tracking-[0.32em] text-blue-700 reveal-badge" delay={80}>
              {hero.badge}
            </Reveal>
            <Reveal as="h1" className="max-w-xl text-[28px] font-semibold leading-[1.15] tracking-tight text-blue-950 sm:text-5xl sm:leading-[1.08] lg:text-6xl" delay={180}>
              {hero.title}
            </Reveal>
            <Reveal as="p" className="mt-4 max-w-md text-sm leading-6 text-slate-600 sm:mt-6 sm:text-base sm:leading-relaxed" delay={320}>
              {hero.description}
            </Reveal>
          </div>
          <Reveal as="div" className="relative grid grid-cols-2 gap-3 h-[210px] sm:block sm:h-auto sm:min-h-[480px] lg:min-h-[560px]" delay={180}>
            <div className="relative h-full w-full sm:absolute sm:right-0 sm:top-0 sm:h-[72%] sm:w-[54%] overflow-hidden rounded-md border border-blue-200 bg-blue-50 shadow-[0_12px_32px_rgba(3,26,74,0.08)]">
              <Image src={`${mediaRoot}/prestige%20(1).jpeg`} alt="Empreinte Flex Prestige mattress" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" priority />
            </div>
            <div className="relative h-full w-full sm:absolute sm:bottom-0 sm:left-0 sm:h-[68%] sm:w-[58%] overflow-hidden rounded-md border border-blue-200 bg-blue-50 shadow-[0_12px_32px_rgba(3,26,74,0.08)]">
              <Image src={`${mediaRoot}/D36%20(1).jpeg`} alt="Empreinte Flex D36 mattress" fill sizes="(min-width: 1024px) 35vw, 60vw" className="object-cover" priority />
            </div>
            <div className="absolute bottom-[12%] right-[9%] hidden h-20 w-20 items-center justify-center rounded-full border border-red-200 bg-white text-center text-[10px] font-medium uppercase leading-tight tracking-widest text-red-600 shadow-sm sm:flex">
              Empreinte<br />Flex
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
        <div className="grid items-end gap-4 sm:gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <Reveal as="p" className="mb-5 text-xs font-medium uppercase tracking-[0.16em] sm:tracking-[0.35em] text-blue-700 reveal-badge">{craft.eyebrow}</Reveal>
            <Reveal as="h2" className="max-w-md text-xl font-semibold leading-tight text-blue-950 sm:text-3xl lg:text-4xl" delay={100}>{craft.title}</Reveal>
          </div>
          <Reveal as="p" className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-lg sm:leading-relaxed lg:pb-1" delay={220}>{craft.description}</Reveal>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-4 sm:gap-5">
          {gallery.map((item, index) => (
            <Reveal key={item.name} as="div" className={`group overflow-hidden rounded-md border border-blue-100 bg-white shadow-sm ${index === 1 ? "sm:translate-y-8" : ""}`} delay={index * 90}>
              <div className="relative aspect-[4/5] overflow-hidden">
                <MediaImage src={item.image} alt={`${item.name} mattress`} />
              </div>
              <div className="flex flex-col items-start gap-1 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <span className="text-sm font-semibold text-blue-950">{item.name}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500 sm:text-[10px] sm:tracking-widest">{craft.collection}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-blue-100 bg-slate-50 px-5 py-10 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-6 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
          <div className="space-y-4 sm:space-y-7">
            <Reveal as="p" className="text-xs uppercase tracking-[0.16em] sm:tracking-[0.35em] text-blue-700 reveal-badge">{editorial.title}</Reveal>
            <Reveal as="h2" className="text-xl font-semibold leading-tight text-blue-950 sm:text-3xl lg:text-4xl" delay={100}>{editorial.lead}</Reveal>
            <Reveal as="p" className="text-sm leading-6 text-slate-600 sm:text-lg sm:leading-relaxed" delay={200}>{editorial.paragraph1}</Reveal>
            <Reveal as="p" className="border-s-2 border-red-500 ps-4 text-sm font-medium leading-6 text-blue-950 sm:text-base sm:leading-relaxed" delay={300}>{editorial.paragraph2}</Reveal>
          </div>
          <Reveal as="div" className="group relative aspect-[4/3] overflow-hidden rounded-md border border-blue-200 bg-blue-950 shadow-[0_12px_32px_rgba(3,26,74,0.1)]" delay={180}>
            <MediaImage src={`${mediaRoot}/D36%20(1).PNG`} alt="Empreinte Flex mattress layers" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 to-transparent" />
            <span className="absolute bottom-5 left-5 text-xs uppercase tracking-[0.12em] sm:tracking-[0.3em] text-white">{craft.detail}</span>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
        <div className="mb-6 sm:mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <Reveal as="p" className="mb-5 text-xs uppercase tracking-[0.16em] sm:tracking-[0.35em] text-blue-700 reveal-badge">{craft.studioEyebrow}</Reveal>
            <Reveal as="h2" className="text-xl font-semibold leading-tight text-blue-950 sm:text-3xl lg:text-4xl" delay={100}>{craft.studioTitle}</Reveal>
          </div>
          <Reveal as="p" className="max-w-sm text-sm leading-6 text-slate-500 sm:leading-relaxed sm:text-end" delay={180}>{craft.studioDescription}</Reveal>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:pb-0">
          {gallery.filter((item) => item.video).map((item, index) => (
            <Reveal key={item.name} as="div" className="group relative aspect-[4/5] w-[82%] shrink-0 snap-start md:w-auto overflow-hidden rounded-md border border-blue-200 bg-blue-950" delay={index * 100}>
              <video autoPlay muted loop playsInline poster={item.detail} className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100">
                <source src={item.video} type="video/quicktime" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                <span className="text-base font-semibold sm:text-lg">{item.name}</span>
                <span className="text-xs uppercase tracking-wide text-blue-200 sm:text-[10px] sm:tracking-widest">{craft.motion}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-blue-950 px-5 py-12 text-center text-white sm:px-10 sm:py-28">
        <div className="absolute inset-0 flex items-center justify-center text-[18vw] font-semibold leading-none text-white/[0.035]">{commitment.rest}</div>
        <div className="relative mx-auto max-w-3xl space-y-5 sm:space-y-8">
          <Reveal as="p" className="text-xs uppercase tracking-[0.16em] sm:tracking-[0.4em] text-blue-200 reveal-badge">{craft.finalEyebrow}</Reveal>
          <Reveal as="h2" className="text-xl font-semibold leading-tight sm:text-4xl" delay={100}>{commitment.title}</Reveal>
          <Reveal as="p" className="text-sm leading-6 text-blue-100 sm:text-lg sm:leading-relaxed" delay={220}>{commitment.paragraph1}</Reveal>
          <Reveal as="p" className="text-base font-medium sm:text-xl" delay={340}>{commitment.paragraph2}</Reveal>
        </div>
      </section>

      <ShopLocationSection
        eyebrow={locations.badge}
        title={locations.title}
        description={locations.description}
        location={locations.showroom}
        artwork={locations.artwork}
        locale={local}
      />
    </main>
  );
}
