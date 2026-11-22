"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiChevronLeft, FiClock, FiPackage, FiPhone, FiPlus, FiTrash2 } from "react-icons/fi";
import { IoBedOutline, IoClose, IoSend } from "react-icons/io5";

import { CHATBOT_CONFIG, CHATBOT_LANGS } from "./chatbotContent";
import { useChatbot } from "./useChatbot";
import MessageBubble from "./MessageBubble";
import QuickReplies from "./QuickReplies";
import RecommendationCard from "./RecommendationCard";
import TypingDots from "./TypingDots";

function resolveLink(type, lang, content) {
  switch (type) {
    case "track":
      return { href: `/${lang}/track-order`, label: content.links.track, Icon: FiPackage, external: false };
    case "seeAll":
      return { href: `/${lang}/mattresses`, label: content.links.seeAll, Icon: IoBedOutline, external: false };
    case "whatsapp":
      return {
        href: `https://wa.me/${CHATBOT_CONFIG.whatsappNumber}?text=${encodeURIComponent(content.links.whatsappMsg)}`,
        label: content.links.whatsapp,
        Icon: FaWhatsapp,
        external: true,
        whatsapp: true,
      };
    case "call":
      return {
        href: `tel:${CHATBOT_CONFIG.phoneTel}`,
        label: `${content.links.call} · ${CHATBOT_CONFIG.phoneDisplay}`,
        Icon: FiPhone,
        external: true,
      };
    default:
      return null;
  }
}

function LinkButton({ link }) {
  const { href, label, Icon, external, whatsapp } = link;
  const cls = [
    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition active:scale-[0.97]",
    whatsapp
      ? "bg-[var(--color-whatsapp)] text-white hover:opacity-90"
      : "border border-blue-200 bg-white text-blue-900 hover:bg-blue-50",
  ].join(" ");
  const inner = (
    <>
      <Icon className="h-4 w-4" />
      <bdi>{label}</bdi>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/* Render a transcript (live or archived) using the given locale content. */
function Transcript({ messages, content, lang }) {
  return messages.map((msg) => {
    if (msg.kind === "recommendations") {
      return (
        <div key={msg.id} className="flex flex-col gap-2.5">
          <MessageBubble role="bot">{msg.heading}</MessageBubble>
          <div className="flex flex-col gap-2.5 ps-9">
            {msg.products.map((product) => (
              <RecommendationCard key={product.slug} product={product} content={content} botLang={lang} />
            ))}
          </div>
        </div>
      );
    }
    if (msg.kind === "links") {
      return (
        <div key={msg.id} className="flex flex-col gap-2">
          <MessageBubble role="bot">{msg.text}</MessageBubble>
          <div className="flex flex-wrap gap-2 ps-9">
            {msg.links
              .map((type) => resolveLink(type, lang, content))
              .filter(Boolean)
              .map((link) => (
                <LinkButton key={link.href} link={link} />
              ))}
          </div>
        </div>
      );
    }
    return (
      <MessageBubble key={msg.id} role={msg.role}>
        {msg.text}
      </MessageBubble>
    );
  });
}

function formatWhen(ts, lang) {
  try {
    const tag = lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en";
    return new Intl.DateTimeFormat(tag, { dateStyle: "medium", timeStyle: "short" }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function conversationPreview(conv) {
  const firstUser = conv.messages.find((m) => m.role === "user" && m.text);
  const firstText = conv.messages.find((m) => m.text);
  return firstUser?.text || firstText?.text || "…";
}

export default function ChatWindow({ botLang, onChangeLang, onClose }) {
  const chat = useChatbot(botLang, onChangeLang);
  const {
    content,
    messages,
    typing,
    quickReplies,
    handleQuickReply,
    handleUserText,
    panel,
    archive,
    archivedView,
    archivedContent,
    newConversation,
    changeLanguage,
    showHistory,
    showChat,
    openArchived,
    removeArchived,
  } = chat;

  const prefersReduced = useReducedMotion();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [draft, setDraft] = useState("");
  const isRTL = content.dir === "rtl";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, panel]);

  useEffect(() => {
    if (panel === "chat") inputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, panel]);

  function submit(e) {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;
    setDraft("");
    handleUserText(value);
  }

  const motionProps = prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 24, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 24, scale: 0.98 },
        transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
      };

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white";

  return (
    <motion.div
      {...motionProps}
      dir={content.dir}
      role="dialog"
      aria-label={content.title}
      style={{ fontFamily: isRTL ? "var(--font-arabic)" : undefined }}
      className="
        fixed inset-0 z-50 flex flex-col overflow-hidden bg-white
        sm:inset-auto sm:bottom-24 sm:left-4 md:left-6
        sm:h-[600px] sm:max-h-[calc(100dvh-8rem)] sm:w-[380px]
        sm:rounded-md sm:border sm:border-blue-200 sm:shadow-[var(--shadow-primary)]
      "
    >
      {/* Header */}
      <header className="flex items-center gap-2 bg-[var(--color-brand-primary)] px-3 py-3 text-white">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
          <IoBedOutline className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{content.title}</p>
          <p className="flex items-center gap-1.5 text-[11px] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-whatsapp)]" />
            {content.online}
          </p>
        </div>

        <div className="flex items-center gap-0.5 rounded-full bg-white/15 p-0.5">
          {CHATBOT_LANGS.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              aria-pressed={lang.code === botLang}
              className={[
                "rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition",
                lang.code === botLang ? "bg-white text-blue-900" : "text-white/80 hover:text-white",
              ].join(" ")}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={panel === "history" ? showChat : showHistory}
          aria-label={content.history.open}
          title={content.history.open}
          aria-pressed={panel === "history"}
          className={`${iconBtn} ${panel === "history" ? "bg-white/20 text-white" : ""}`}
        >
          <FiClock className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={newConversation}
          aria-label={content.history.newChat}
          title={content.history.newChat}
          className={iconBtn}
        >
          <FiPlus className="h-5 w-5" />
        </button>
        <button type="button" onClick={onClose} aria-label={content.close} className={iconBtn}>
          <IoClose className="h-5 w-5" />
        </button>
      </header>

      {/* ── CHAT PANEL ─────────────────────────────────────────────────── */}
      {panel === "chat" && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-surface-muted)] px-3.5 py-4"
          >
            <Transcript messages={messages} content={content} lang={botLang} />
            {typing && <TypingDots />}
          </div>

          <div className="border-t border-blue-100 bg-white px-3.5 pb-3 pt-3">
            {!typing && quickReplies.length > 0 && (
              <div className="mb-2.5">
                <QuickReplies options={quickReplies} onSelect={handleQuickReply} disabled={typing} />
              </div>
            )}
            <form onSubmit={submit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={content.input.placeholder}
                aria-label={content.input.placeholder}
                className="min-w-0 flex-1 rounded-full border border-blue-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
              />
              <button
                type="submit"
                aria-label={content.input.send}
                disabled={!draft.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-900 text-white transition hover:bg-blue-800 disabled:opacity-40"
              >
                <IoSend className="h-4 w-4 rtl:rotate-180" />
              </button>
            </form>
          </div>
        </>
      )}

      {/* ── HISTORY LIST ───────────────────────────────────────────────── */}
      {panel === "history" && !archivedView && (
        <div className="flex-1 overflow-y-auto bg-[var(--color-surface-muted)] p-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {content.history.title}
          </p>
          {archive.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm text-slate-400">{content.history.empty}</p>
          ) : (
            <ul className="space-y-2">
              {archive.map((conv) => (
                <li key={conv.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openArchived(conv.id)}
                    onKeyDown={(e) => (e.key === "Enter" ? openArchived(conv.id) : null)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-blue-100 bg-white p-3 text-start transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        <bdi>{conversationPreview(conv)}</bdi>
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        <bdi>{formatWhen(conv.endedAt, botLang)}</bdi> ·{" "}
                        <bdi>{String(conv.botLang || "").toUpperCase()}</bdi>
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={content.history.delete}
                      title={content.history.delete}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeArchived(conv.id);
                      }}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── ARCHIVED CONVERSATION (read-only) ──────────────────────────── */}
      {panel === "history" && archivedView && archivedContent && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-blue-100 bg-white px-3 py-2">
            <button
              type="button"
              onClick={showHistory}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-blue-900 transition hover:bg-blue-50"
            >
              <FiChevronLeft className="h-4 w-4 rtl:rotate-180" />
              {content.history.back}
            </button>
            <span className="truncate text-[11px] text-slate-400">{content.history.readonly}</span>
          </div>
          <div
            dir={archivedContent.dir}
            style={{ fontFamily: archivedContent.dir === "rtl" ? "var(--font-arabic)" : undefined }}
            className="flex-1 space-y-3 overflow-y-auto bg-[var(--color-surface-muted)] px-3.5 py-4"
          >
            <Transcript messages={archivedView.messages} content={archivedContent} lang={archivedView.botLang} />
          </div>
          <div className="border-t border-blue-100 bg-white p-3">
            <button
              type="button"
              onClick={newConversation}
              className="w-full rounded-full bg-blue-900 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              {content.history.newChat}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
