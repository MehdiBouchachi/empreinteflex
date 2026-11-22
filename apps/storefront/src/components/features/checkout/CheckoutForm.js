"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { fullNameFromDraft } from "@/lib/customer-name";

/* ═══════════════════════════════════════════════════════════════════
   58 WILAYAS — official Algeria administrative divisions
═══════════════════════════════════════════════════════════════════ */
const WILAYAS = [
  { code: "01", name: "Adrar" },
  { code: "02", name: "Chlef" },
  { code: "03", name: "Laghouat" },
  { code: "04", name: "Oum El Bouaghi" },
  { code: "05", name: "Batna" },
  { code: "06", name: "Béjaïa" },
  { code: "07", name: "Biskra" },
  { code: "08", name: "Béchar" },
  { code: "09", name: "Blida" },
  { code: "10", name: "Bouira" },
  { code: "11", name: "Tamanrasset" },
  { code: "12", name: "Tébessa" },
  { code: "13", name: "Tlemcen" },
  { code: "14", name: "Tiaret" },
  { code: "15", name: "Tizi Ouzou" },
  { code: "16", name: "Alger" },
  { code: "17", name: "Djelfa" },
  { code: "18", name: "Jijel" },
  { code: "19", name: "Sétif" },
  { code: "20", name: "Saïda" },
  { code: "21", name: "Skikda" },
  { code: "22", name: "Sidi Bel Abbès" },
  { code: "23", name: "Annaba" },
  { code: "24", name: "Guelma" },
  { code: "25", name: "Constantine" },
  { code: "26", name: "Médéa" },
  { code: "27", name: "Mostaganem" },
  { code: "28", name: "M'Sila" },
  { code: "29", name: "Mascara" },
  { code: "30", name: "Ouargla" },
  { code: "31", name: "Oran" },
  { code: "32", name: "El Bayadh" },
  { code: "33", name: "Illizi" },
  { code: "34", name: "Bordj Bou Arréridj" },
  { code: "35", name: "Boumerdès" },
  { code: "36", name: "El Tarf" },
  { code: "37", name: "Tindouf" },
  { code: "38", name: "Tissemsilt" },
  { code: "39", name: "El Oued" },
  { code: "40", name: "Khenchela" },
  { code: "41", name: "Souk Ahras" },
  { code: "42", name: "Tipaza" },
  { code: "43", name: "Mila" },
  { code: "44", name: "Aïn Defla" },
  { code: "45", name: "Naâma" },
  { code: "46", name: "Aïn Témouchent" },
  { code: "47", name: "Ghardaïa" },
  { code: "48", name: "Relizane" },
  { code: "49", name: "Timimoun" },
  { code: "50", name: "Bordj Badji Mokhtar" },
  { code: "51", name: "Ouled Djellal" },
  { code: "52", name: "Béni Abbès" },
  { code: "53", name: "In Salah" },
  { code: "54", name: "In Guezzam" },
  { code: "55", name: "Touggourt" },
  { code: "56", name: "Djanet" },
  { code: "57", name: "El M'Ghair" },
  { code: "58", name: "El Meniaa" },

  /* ── NEW WILAYAS (59 → 69) ── */
  { code: "59", name: "Ouled Djellal Nord" },
  { code: "60", name: "Bordj Zemoura" },
  { code: "61", name: "Aïn El Hammam" },
  { code: "62", name: "Aïn Lahdjar" },
  { code: "63", name: "Beni Ounif" },
  { code: "64", name: "El Meghaier Sud" },
  { code: "65", name: "Hassi Messaoud" },
  { code: "66", name: "Bir El Ater" },
  { code: "67", name: "Hassi Bahbah" },
  { code: "68", name: "Sidi Aïch" },
  { code: "69", name: "El Abadia" },
];

/* ═══════════════════════════════════════════════════════════════════
   STORAGE KEY
═══════════════════════════════════════════════════════════════════ */
const DRAFT_KEY = "empreinte_checkout_draft";

/* ═══════════════════════════════════════════════════════════════════
   VALIDATORS
═══════════════════════════════════════════════════════════════════ */
const validate = {
  fullName: (v) =>
    !v?.trim()
      ? "Ce champ est requis"
      : v.trim().length < 2
        ? "Minimum 2 caractères"
        : "",
  email: (v) => {
    if (!v?.trim()) return "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ""
      : "Adresse e-mail invalide";
  },
  phone: (v) => {
    if (!v?.trim()) return "Ce champ est requis";
    const d = v.replace(/[\s\-().+]/g, "");
    if (!/^\d+$/.test(d)) return "Numéro invalide";
    if (d.length < 9 || d.length > 10) {
      return "Numéro algérien invalide (9–10 chiffres)";
    }
    return "";
  },
  wilaya: (v) => !v?.trim() ? "Veuillez sélectionner une wilaya" : "",
  city: () => "",
  street: () => "",
  mapLink: () => "",
};

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  wilaya: "",
  city: "",
  street: "",
  mapLink: "",
};

const REQUIRED_FIELDS = ["fullName", "phone", "wilaya"];

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */
function loadDraft() {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return { ...EMPTY, ...parsed, fullName: fullNameFromDraft(parsed) };
  } catch {
    return EMPTY;
  }
}

function Err({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs leading-tight text-red-500">
      <span aria-hidden>⚠</span> {msg}
    </p>
  );
}

function WilayaSelect({ value, onChange, onBlur, hasError, placeholder }) {
  return (
    <select
      name="wilaya"
      required
      aria-required="true"
      aria-label={placeholder}
      aria-invalid={hasError}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`
        w-full appearance-none rounded-md border bg-white px-3 py-2.5
        text-sm outline-none transition-all duration-200 sm:px-4 sm:py-3 sm:text-base
        ${
          hasError
            ? "border-red-400 focus:ring-2 focus:ring-red-200"
            : "border-blue-200 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/15"
        }
        ${!value ? "text-slate-400" : "text-slate-900"}
      `}
    >
      <option value="">{placeholder}</option>
      {WILAYAS.map((w) => (
        <option key={w.code} value={w.name}>
          {w.code} — {w.name}
        </option>
      ))}
    </select>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="border-b border-blue-50 pb-1 text-base font-semibold text-slate-900 sm:text-lg">
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHECKOUT FORM
═══════════════════════════════════════════════════════════════════ */
function CheckoutForm({ data, actions, i18n }) {
  const { isSubmitting } = data;
  const { change, submit } = actions;
  const { contact, shipping, payment, button } = i18n;

  const [fields, setFields] = useState(loadDraft);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(fields));
    } catch {}
  }, [fields]);

  useEffect(() => {
    const hasAny = Object.values(fields).some((v) => String(v).trim());
    if (!hasAny) return;

    const guard = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [fields]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFields((prev) => ({ ...prev, [name]: value }));

      if (touched[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validate[name]?.(value) ?? "",
        }));
      }

      change?.({ target: { name, value } });
    },
    [touched, change],
  );

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validate[name]?.(value) ?? "",
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    const allTouched = Object.keys(validate).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {},
    );

    const allErrors = REQUIRED_FIELDS.reduce(
      (acc, key) => ({ ...acc, [key]: validate[key](fields[key]) }),
      {},
    );

    setTouched(allTouched);
    setErrors(allErrors);

    const firstErrKey = Object.keys(allErrors).find((key) => allErrors[key]);
    if (firstErrKey) {
      document
        .querySelector(`[name="${firstErrKey}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}

    submit?.(fields);
  }, [fields, submit]);

  const fp = (name) => ({
    name,
    value: fields[name] ?? "",
    onChange: handleChange,
    onBlur: handleBlur,
  });

  const err = (name) => (touched[name] ? errors[name] : "");

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <section className="space-y-4 sm:space-y-5">
        <SectionTitle>{contact.title}</SectionTitle>

        <div>
          <Input
            placeholder={contact.fullName}
            aria-label={contact.fullName}
            autoComplete="name"
            required
            error={!!err("fullName")}
            {...fp("fullName")}
          />
          <Err msg={err("fullName")} />
        </div>

        <div>
          <Input
            type="tel"
            placeholder={contact.phone}
            error={!!err("phone")}
            {...fp("phone")}
          />
          <Err msg={err("phone")} />
        </div>

        <div>
          <Input
            type="email"
            placeholder={contact.email}
            error={!!err("email")}
            {...fp("email")}
          />
          <Err msg={err("email")} />
        </div>
      </section>

      <section className="space-y-4 sm:space-y-5">
        <SectionTitle>{shipping.title}</SectionTitle>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <WilayaSelect
              value={fields.wilaya}
              onChange={handleChange}
              onBlur={handleBlur}
              hasError={!!err("wilaya")}
              placeholder={shipping.wilaya || "Wilaya"}
            />
            <Err msg={err("wilaya")} />
          </div>

          <div>
            <Input placeholder={shipping.city} {...fp("city")} />
          </div>
        </div>
      </section>

      <section className="space-y-5 sm:space-y-6">
        <SectionTitle>{payment.title}</SectionTitle>

        <div className="rounded-md border border-blue-200 bg-blue-50/40 p-4 sm:rounded-md sm:p-6">
          <p className="text-sm font-semibold text-slate-900 sm:text-base">
            {payment.method}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            {payment.description}
          </p>
        </div>

        <div className="pt-2 sm:pt-4">
          <Button
            variant="cta"
            size="lg"
            fullWidth
            loading={isSubmitting}
            loadingLabel={button.processing}
            onClick={handleSubmit}
          >
            {button.submit}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default CheckoutForm;
