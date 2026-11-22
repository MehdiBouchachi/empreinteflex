"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
import MattressPreview from "./MattressPreview";

const copy = {
  fr: {
    eyebrow: "À chaque lit, son matelas",
    title: "Trouvez votre dimension",
    desc: "Choisissez la taille de votre lit pour découvrir les matelas disponibles.",
    models: "modèles",
    model: "modèle",
    unit: "cm",
  },
  en: {
    eyebrow: "A mattress for every bed",
    title: "Find your size",
    desc: "Choose your bed size to explore the mattresses available in that dimension.",
    models: "models",
    model: "model",
    unit: "cm",
  },
  ar: {
    eyebrow: "لكل سرير مرتبته",
    title: "اختر المقاس المناسب",
    desc: "اختر مقاس سريرك لاكتشاف المراتب المتوفرة بهذا المقاس.",
    models: "موديلات",
    model: "موديل",
    unit: "سم",
  },
};

const labels = {
  fr: {
    choose: "Votre dimension",
    available: "tailles disponibles",
    measure: "Largeur × longueur",
    explore: "Explorer les matelas",
  },
  en: {
    choose: "Your size",
    available: "available sizes",
    measure: "Width × length",
    explore: "Explore mattresses",
  },
  ar: {
    choose: "مقاسك",
    available: "مقاسات متوفرة",
    measure: "العرض × الطول",
    explore: "اكتشف المراتب",
  },
};

export default function MattressSizesExplorer({ sizes, locale = "fr" }) {
  const router = useRouter();
  const [previewSize, setPreviewSize] = useState(null);
  const selectSize = (size) => {
    setPreviewSize(size);
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      router.push(`/${locale}/mattresses?size=${encodeURIComponent(size)}`);
    }
  };
  const previewOnHover = (event, size) => {
    if (
      event.pointerType === "mouse" &&
      window.matchMedia("(any-hover: hover)").matches
    ) {
      setPreviewSize(size);
    }
  };
  const active =
    sizes.find((item) => item.size === previewSize) ||
    sizes.find((item) => item.size === "160x200") ||
    sizes[0];
  if (!sizes.length) return null;
  const t = copy[locale] || copy.fr;
  const label = labels[locale] || labels.fr;
  return (
    <section
      aria-labelledby="mattress-sizes-title"
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="bg-white py-5 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="relative isolate overflow-hidden rounded-md bg-[#071b49] px-5 py-7 shadow-[0_16px_40px_rgba(7,27,73,0.12)] sm:px-10 sm:py-12 lg:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-danger)]/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-32 -top-64 -z-10 h-[36rem] w-[36rem] rounded-full border border-white/5"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-16 -top-48 -z-10 h-[28rem] w-[28rem] rounded-full border border-white/5"
          />
          <div className="grid gap-7 lg:grid-cols-[0.85fr_1.4fr] lg:items-center lg:gap-14">
            <div>
              <span
                aria-hidden="true"
                className="mb-4 block h-0.5 w-10 bg-[var(--color-danger)] sm:mb-5"
              />
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--color-danger)] sm:mb-3">
                {t.eyebrow}
              </p>
              <Heading
                as="h2"
                id="mattress-sizes-title"
                className="max-w-[15ch] !text-white lg:!text-4xl !leading-tight"
              >
                {t.title}
              </Heading>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-100/75 sm:mt-4">
                {t.desc}
              </p>
              <div className="mx-auto mt-2 max-w-[190px] sm:mt-4 sm:max-w-[300px] lg:mx-0 lg:mt-7">
                <MattressPreview size={active.size} unit={t.unit} />
                <div className="mt-0 flex items-center justify-between border-t border-white/15 pt-2 sm:mt-1 sm:pt-3">
                  <p className="text-[10px] tracking-wider text-blue-100/60">
                    {label.measure}
                  </p>
                  <p
                    data-size-preview
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="text-sm tabular-nums text-white"
                  >
                    <bdi dir="ltr">{active.size.replace(/[x×]/g, " × ")}</bdi>{" "}
                    <span className="text-[10px]">{t.unit}</span>
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 sm:mb-4 sm:pb-4">
                <p className="text-xs font-medium text-white/90">
                  {label.choose}
                </p>
                <span className="text-[10px] tracking-wide text-[var(--color-danger)]">
                  {sizes.length} {label.available}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
                {sizes.map(({ size, count }) => (
                  <button
                    key={size}
                    type="button"
                    onPointerEnter={(event) => previewOnHover(event, size)}
                    onFocus={() => setPreviewSize(size)}
                    onClick={() => selectSize(size)}
                    data-size-option={size}
                    aria-pressed={active.size === size}
                    data-previewed={active.size === size}
                    aria-label={`${label.explore} · ${size.replace(/[x×]/g, " × ")} ${t.unit}`}
                    className="group relative flex min-h-[58px] items-center justify-between gap-2 overflow-hidden rounded-md border border-white/15 bg-white/[0.03] px-3 py-2.5 text-white transition-colors duration-200 hover:bg-white/[0.08] data-[previewed=true]:border-[var(--color-danger)] data-[previewed=true]:bg-white/[0.08] focus-visible:border-[var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] sm:min-h-[86px] sm:px-4 sm:py-3"
                  >
                    <span>
                      <span className="block text-[11px] font-medium sm:text-base">
                        <bdi dir="ltr">{size.replace(/[x×]/g, " × ")}</bdi>{" "}
                        <span className="hidden text-[10px] font-normal text-blue-100/60 sm:inline">
                          {t.unit}
                        </span>
                      </span>
                      <span className="mt-1.5 hidden sm:block text-[10px] text-blue-100/65 group-hover:text-blue-100/90">
                        {count} {count === 1 ? t.model : t.models}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm text-[var(--color-danger)]"
                    >
                      {locale === "ar" ? "←" : "→"}
                    </span>
                  </button>
                ))}
              </div>
              <Link
                data-size-results
                href={`/${locale}/mattresses?size=${encodeURIComponent(active.size)}`}
                className="[@media(hover:hover)_and_(pointer:fine)]:hidden mt-5 flex min-h-12 items-center justify-between gap-3 rounded-md bg-[var(--color-danger)] px-4 py-3 text-white transition-colors hover:bg-[var(--color-danger-strong)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)]"
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {label.explore}
                  </span>
                  <span className="mt-1 block text-xs opacity-75">
                    <bdi dir="ltr">{active.size.replace(/[x×]/g, " × ")}</bdi>{" "}
                    {t.unit} · {active.count}{" "}
                    {active.count === 1 ? t.model : t.models}
                  </span>
                </span>
                <span aria-hidden="true">{locale === "ar" ? "←" : "→"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
