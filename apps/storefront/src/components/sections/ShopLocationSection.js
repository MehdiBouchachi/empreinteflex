import { FiArrowUpRight } from "react-icons/fi";

const SHOP_MAPS_URL = "https://maps.app.goo.gl/2XSy2XnUEJXBXbXy8";
const SHOP_ADDRESS = "P299+F6P, Rte de Sebala, Draria";

// Real map, centred on the showroom. Rendered non-interactive and tinted to
// match the brand; the whole card links to Google Maps.
const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=P299%2BF6P%2C%20Draria&z=15&output=embed";
// The iframe is extended above the card to hide Google's place card, which
// moves the map centre (and therefore our pin) up by half that amount.
const MAP_CROP_TOP = 100;

function LocationMap({ locale, artwork }) {
  const mapUrl = `${MAP_EMBED_URL}&hl=${locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en"}`;

  return (
    <a
      href={SHOP_MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={artwork.mapTitle}
      className="group relative block min-h-82.5 overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] ring-1 ring-slate-200 sm:min-h-107.5"
    >
      <iframe
        title={artwork.mapTitle}
        src={mapUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        tabIndex={-1}
        className="pointer-events-none absolute left-0 w-full border-0 transition-transform duration-1000 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
        style={{
          top: -MAP_CROP_TOP,
          height: `calc(100% + ${MAP_CROP_TOP}px)`,
          filter: "grayscale(1) brightness(1.06) contrast(0.9)",
        }}
      />

      {/* Soft white edges + a fine inner frame */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_70px_20px_rgba(255,255,255,0.75)]" />
      <div className="pointer-events-none absolute inset-3 rounded-xl border border-white/80 sm:inset-4" />

      {/* Pin — its tip sits exactly on the map centre */}
      <div
        className="pointer-events-none absolute left-1/2"
        style={{ top: `calc(50% - ${MAP_CROP_TOP / 2}px)` }}
      >
        <span className="absolute left-0 top-0 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-950/15 bg-white/40" />
        <span className="absolute left-0 top-0 h-2 w-7 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-slate-900/25 blur-[2px]" />
        <svg
          viewBox="0 0 40 54"
          className="absolute left-0 top-0 h-13.5 w-10 -translate-x-1/2 -translate-y-full transition-transform duration-500 ease-out group-hover:-translate-y-[calc(100%+4px)] motion-reduce:transition-none"
          aria-hidden="true"
        >
          <path
            d="M20 53S2 33 2 20a18 18 0 0 1 36 0c0 13-18 33-18 33Z"
            fill="#0b1d5c"
            stroke="#fff"
            strokeWidth="2"
          />
          <circle cx="20" cy="20" r="6.5" fill="#fff" />
          <circle cx="20" cy="20" r="2.5" fill="#c81e1e" />
        </svg>
      </div>

      {/* Caption */}
      <div className="absolute inset-x-4 bottom-12 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-72">
        <div className="rounded-xl bg-white px-6 py-5 shadow-[0_16px_40px_-18px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/5">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-500">
            {artwork.label} · Draria
          </p>
          <p
            className="mt-2 text-xl font-semibold leading-snug text-blue-950 sm:text-[1.4rem]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {artwork.tagline}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-600">
            <span>{SHOP_ADDRESS}</span>
            <FiArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-blue-950 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </div>
        </div>
      </div>
    </a>
  );
}


export default function ShopLocationSection({
  eyebrow,
  title,
  description,
  location,
  locale = "en",
  artwork,
}) {
  return (
    <section className="overflow-hidden border-y border-slate-100 bg-white px-5 py-12 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <LocationMap locale={locale} artwork={artwork} />

        <div className="max-w-xl">
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.25em] text-red-600">
            {eyebrow}
          </p>
          <h2 className="text-3xl font-semibold leading-[1.08] tracking-tight text-blue-950 sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-lg sm:leading-relaxed">
            {description}
          </p>

          <div className="mt-8 border-t border-blue-200 pt-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-700">
              {location.label}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-blue-950 sm:text-xl">
              {location.title}
            </h3>
            <p className="mt-2 text-sm text-slate-500">{location.description}</p>
            <p className="mt-3 text-sm font-medium text-blue-950">{SHOP_ADDRESS}</p>
            <a
              href={SHOP_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors hover:text-red-600"
            >
              {location.open}
              <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
