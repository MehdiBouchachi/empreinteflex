"use client";

import { useState, useRef, useEffect } from "react";

/* Fallback strings if a locale is missing the `errors` block. */
const FALLBACK_ERRORS = {
  nameRequired: "Please enter your full name.",
  nameShort: "Name must be at least 2 characters.",
  emailRequired: "Please enter your email address.",
  emailInvalid: "Please enter a valid email address.",
  messageRequired: "Please write a message.",
  messageShort: "Message must be at least 10 characters.",
  server: "Something went wrong. Please try again.",
};

function validateField(name, value, e) {
  if (name === "fullName") {
    if (!value.trim()) return e.nameRequired;
    if (value.trim().length < 2) return e.nameShort;
  }

  if (name === "email") {
    if (!value.trim()) return e.emailRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return e.emailInvalid;
    }
  }

  if (name === "message") {
    if (!value.trim()) return e.messageRequired;
    if (value.trim().length < 10) {
      return e.messageShort;
    }
  }

  return "";
}

export default function ContactForm({ form }) {
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const errorMsgs = { ...FALLBACK_ERRORS, ...(form.errors || {}) };

  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      el.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));

    if (touched[name]) {
      setErrors((err) => ({
        ...err,
        [name]: validateField(name, value, errorMsgs),
      }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((err) => ({
      ...err,
      [name]: validateField(name, value, errorMsgs),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    Object.keys(fields).forEach((k) => {
      const err = validateField(k, fields[k], errorMsgs);
      if (err) newErrors[k] = err;
    });

    setErrors(newErrors);
    setTouched({ fullName: true, email: true, message: true });

    if (Object.keys(newErrors).length > 0) return;

    setStatus("loading");
    setServerError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setFields({ fullName: "", email: "", message: "" });
        setTouched({});
        setErrors({});
      } else if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
      } else {
        setServerError(data.message || errorMsgs.server);
        setStatus("error");
      }
    } catch {
      setServerError(errorMsgs.server);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div ref={ref} className="contact-reveal is-visible">
        <div className="flex flex-col items-start gap-5 rounded-md border border-blue-200 bg-blue-50 px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-blue-200 bg-white">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10.5L8 14.5L16 6.5"
                stroke="var(--color-brand-primary)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-blue-950">
              {form.successTitle || "Message received."}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-blue-950/70">
              {form.successMessage ||
                "Thank you for reaching out. We'll be in touch shortly."}
            </p>
          </div>

          <button
            onClick={() => setStatus("idle")}
            className="mt-1 text-sm font-medium text-blue-900 underline underline-offset-4 transition-colors duration-200 hover:text-blue-950"
          >
            {form.sendAnother || "Send another message"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="contact-reveal">
      <div className="mb-4">
        <h2
          className="contact-stagger text-lg font-semibold tracking-tight text-blue-950 sm:text-xl"
          style={{ "--stagger-delay": "0ms" }}
        >
          {form.title}
        </h2>

        {form.description ? (
          <p
            className="contact-stagger mt-2 hidden max-w-lg text-sm leading-relaxed text-blue-950/70 sm:block"
            style={{ "--stagger-delay": "60ms" }}
          >
            {form.description}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
        <FieldWrapper delay="180ms" error={touched.fullName && errors.fullName}>
          <FieldLabel htmlFor="fullName">{form.fullName}</FieldLabel>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={fields.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!(touched.fullName && errors.fullName)}
            aria-describedby={errors.fullName ? "error-fullName" : undefined}
            placeholder={form.fullName}
            className={fieldClass(touched.fullName && errors.fullName)}
          />
          <FieldError
            id="error-fullName"
            message={touched.fullName && errors.fullName}
          />
        </FieldWrapper>

        <FieldWrapper delay="240ms" error={touched.email && errors.email}>
          <FieldLabel htmlFor="email">{form.email}</FieldLabel>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!(touched.email && errors.email)}
            aria-describedby={errors.email ? "error-email" : undefined}
            placeholder={form.email}
            className={fieldClass(touched.email && errors.email)}
          />
          <FieldError
            id="error-email"
            message={touched.email && errors.email}
          />
        </FieldWrapper>

        </div>
        <FieldWrapper delay="300ms" error={touched.message && errors.message}>
          <FieldLabel htmlFor="message">{form.message}</FieldLabel>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={fields.message}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!(touched.message && errors.message)}
            aria-describedby={errors.message ? "error-message" : undefined}
            placeholder={form.message}
            className={`${fieldClass(touched.message && errors.message)} min-h-[88px] resize-y`}
          />
          <FieldError
            id="error-message"
            message={touched.message && errors.message}
          />
        </FieldWrapper>

        {status === "error" && serverError && (
          <p role="alert" className="text-sm leading-relaxed text-red-600">
            {serverError}
          </p>
        )}

        <div
          className="contact-stagger pt-2"
          style={{ "--stagger-delay": "360ms" }}
        >
          <button
            type="submit"
            disabled={status === "loading"}
            className="
              w-full rounded-md
              bg-blue-900 px-6 py-3
              text-sm font-semibold tracking-[0.03em] text-white
              transition-colors duration-300 ease-out
              hover:bg-blue-800
              active:scale-[0.99]
              disabled:cursor-not-allowed disabled:opacity-60
              focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-blue-900
            "
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                {form.sending || "Sending…"}
              </span>
            ) : (
              form.button
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldWrapper({ children, delay }) {
  return (
    <div
      className="contact-stagger space-y-1.5"
      style={{ "--stagger-delay": delay }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium tracking-wide text-blue-950/70"
    >
      {children}
    </label>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-1 text-xs leading-relaxed text-red-500"
    >
      {message}
    </p>
  );
}

function fieldClass(hasError) {
  return [
    "w-full rounded-md border bg-white px-3 py-2.5 text-sm text-blue-950",
    "placeholder:text-blue-950/45 outline-none",
    "transition-colors duration-200 focus:bg-white",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    hasError
      ? "border-red-300 focus:border-red-400 focus-visible:outline-red-700"
      : "border-blue-900/20 focus:border-blue-900 focus-visible:outline-blue-900",
  ].join(" ");
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="28"
        strokeDashoffset="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
