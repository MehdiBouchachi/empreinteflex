import Link from "next/link";
import "@/styles/globals.css";

export default function NotFound({ params }) {
  const locale = params?.local || "en";

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-6 overflow-hidden">
      {/* Ghost watermark - same as About/WhyLitmad */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-semibold text-blue-900 opacity-[0.03] tracking-tight whitespace-nowrap"
          style={{ fontSize: "clamp(80px, 25vw, 260px)" }}
        >
          404
        </span>
      </div>

      {/* Radial tint from top */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(var(--rgb-brand-border), 0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-xl text-center">
        {/* Eyebrow */}
        <p className="text-[10px] uppercase tracking-[0.5em] text-blue-900/50 mb-6">
          Empreinte Flex
        </p>

        {/* 404 number */}
        <h1
          className="font-semibold text-slate-900 tracking-[-0.03em] leading-none mb-4"
          style={{ fontSize: "clamp(80px, 20vw, 160px)" }}
        >
          404
        </h1>

        {/* Accent rule */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-10 bg-blue-900/20" />
          <div className="w-1 h-1 rounded-full bg-red-600/60" />
          <div className="h-px w-10 bg-blue-900/20" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
          Page introuvable
        </h2>

        {/* Description */}
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-sm mx-auto mb-10">
          La page que vous recherchez n&apos;existe pas ou a &eacute;t&eacute;
          d&eacute;plac&eacute;e. Retournez &agrave; l&apos;accueil ou explorez
          notre collection de matelas.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}`}
            className="px-7 py-3 rounded-md bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            Retour &agrave; l&apos;accueil
          </Link>
          <Link
            href={`/${locale}/mattresses`}
            className="px-7 py-3 rounded-md border border-blue-900/30 text-blue-900 text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Voir les matelas
          </Link>
        </div>
      </div>
    </div>
  );
}
