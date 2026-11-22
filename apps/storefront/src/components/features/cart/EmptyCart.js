export default function EmptyCart({ data, actions, i18n = {} }) {
  const { locale } = data;
  const { back } = actions;

  const { title, description, continue: continueText } = i18n;

  const isRTL = locale === "ar";

  return (
    <main
      className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-5 py-20 sm:px-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-xl text-center">
        <h1 className="text-2xl font-semibold text-blue-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          {description}
        </p>
        <button
          onClick={back}
          className="mt-7 inline-flex items-center rounded-md bg-blue-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          {continueText}
          <span className="ms-2" aria-hidden="true">
            {isRTL ? "←" : "→"}
          </span>
        </button>
      </div>
    </main>
  );
}
