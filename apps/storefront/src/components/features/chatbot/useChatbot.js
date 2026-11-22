"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { products as STATIC_PRODUCTS } from "@/constants/products";
import { formatPrice } from "@/utils/helpers";
import { getChatbotContent, matchIntent } from "./chatbotContent";
import { normalizeProduct, recommend } from "./recommender";
import {
  archiveConversation,
  deleteArchived,
  loadArchive,
  loadCurrent,
  saveCurrent,
} from "./chatStore";

let messageSeq = 0;
const nextId = () => `cb-${Date.now().toString(36)}-${(messageSeq += 1)}`;
const newConvId = () => `conv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/* Bundled fallback catalog (used if the live API is unavailable). */
function staticCatalog() {
  return STATIC_PRODUCTS.map(normalizeProduct).filter(Boolean);
}

/*  view: "menu" | "quiz" | "result" | "faq"   (the live conversation step)
    panel: "chat" | "history"                  (which surface is shown)
    Messages are the transcript; quick replies are derived from (view, quizIndex).
    The active conversation is persisted to localStorage; finished ones archive. */
export function useChatbot(botLang, setBotLang) {
  const content = getChatbotContent(botLang);

  const [messages, setMessages] = useState([]);
  const [view, setView] = useState("menu");
  const [quizIndex, setQuizIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);

  const [panel, setPanel] = useState("chat");
  const [archive, setArchive] = useState([]);
  const [archivedView, setArchivedView] = useState(null);

  const answersRef = useRef({});
  const catalogRef = useRef({}); // lang -> normalized catalog
  const timersRef = useRef([]);
  const convMetaRef = useRef({ id: newConvId(), startedAt: Date.now() });
  const stateRef = useRef({ messages: [], view: "menu", quizIndex: 0 });
  const hydratedRef = useRef(false);

  useEffect(() => {
    stateRef.current = { messages, view, quizIndex };
  }, [messages, view, quizIndex]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addUser = useCallback((text) => {
    setMessages((prev) => [...prev, { id: nextId(), role: "user", kind: "text", text }]);
  }, []);

  /* Push a bot message after a short "typing" pause. Accepts an object or a
     lazy factory (so recommendations read the freshest catalog). */
  const addBot = useCallback((msgOrFactory, delay = 550) => {
    setTyping(true);
    const t = setTimeout(() => {
      const msg = typeof msgOrFactory === "function" ? msgOrFactory() : msgOrFactory;
      setTyping(false);
      if (msg) setMessages((prev) => [...prev, { id: nextId(), role: "bot", ...msg }]);
    }, delay);
    timersRef.current.push(t);
  }, []);

  const currentCatalog = useCallback(() => {
    const live = catalogRef.current[botLang];
    if (live && live.length) return live;
    return staticCatalog();
  }, [botLang]);

  /* Start a brand-new conversation (greeting only) in the given language. */
  const freshConversation = useCallback(
    (lang = botLang) => {
      clearTimers();
      setTyping(false);
      convMetaRef.current = { id: newConvId(), startedAt: Date.now() };
      answersRef.current = {};
      setQuizIndex(0);
      setView("menu");
      setMessages([{ id: nextId(), role: "bot", kind: "text", text: getChatbotContent(lang).greeting }]);
    },
    [botLang, clearTimers],
  );

  const archiveCurrentToStore = useCallback(() => {
    archiveConversation({
      id: convMetaRef.current.id,
      startedAt: convMetaRef.current.startedAt,
      botLang,
      messages: stateRef.current.messages,
    });
  }, [botLang]);

  /* Restore the persisted conversation on mount (survives close/reopen/reload). */
  useEffect(() => {
    const saved = loadCurrent();
    if (saved && saved.messages?.length) {
      setMessages(saved.messages);
      setView(saved.view || "menu");
      setQuizIndex(saved.quizIndex || 0);
      answersRef.current = saved.answers || {};
      convMetaRef.current = { id: saved.id || newConvId(), startedAt: saved.startedAt || Date.now() };
      if (saved.botLang && saved.botLang !== botLang) setBotLang(saved.botLang);
    } else {
      freshConversation(botLang);
    }
    setArchive(loadArchive());
    hydratedRef.current = true;
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Persist the active conversation on every change. */
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveCurrent({
      id: convMetaRef.current.id,
      startedAt: convMetaRef.current.startedAt,
      updatedAt: Date.now(),
      botLang,
      messages,
      view,
      quizIndex,
      answers: answersRef.current,
    });
  }, [messages, view, quizIndex, botLang]);

  /* Lazily load the live localized catalog (once per language). */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (catalogRef.current[botLang]?.length) {
        setCatalogReady(true);
        return;
      }
      try {
        const res = await fetch(`/api/chatbot/catalog?locale=${botLang}`);
        const data = await res.json();
        const cat = Array.isArray(data.catalog) && data.catalog.length ? data.catalog : staticCatalog();
        if (!cancelled) {
          catalogRef.current[botLang] = cat;
          setCatalogReady(true);
        }
      } catch {
        if (!cancelled) {
          catalogRef.current[botLang] = staticCatalog();
          setCatalogReady(true);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [botLang]);

  /* ── Conversation moves ─────────────────────────────────────────────── */

  const startQuiz = useCallback(() => {
    answersRef.current = {};
    setView("quiz");
    setQuizIndex(0);
    addBot({ kind: "text", text: content.quiz.intro }, 400);
    addBot({ kind: "text", text: content.quiz.questions[0].prompt }, 900);
  }, [addBot, content]);

  const finishQuiz = useCallback(
    (answers) => {
      addBot({ kind: "text", text: content.quiz.analyzing }, 400);
      addBot(() => {
        const { items, relaxedBudget } = recommend(currentCatalog(), answers, { limit: 2 });
        if (!items.length) return { kind: "text", text: content.result.none };
        return {
          kind: "recommendations",
          heading: relaxedBudget ? content.result.relaxed : content.result.intro,
          products: items.map((i) => ({ ...i.product, reasons: i.reasons })),
        };
      }, 1000);
    },
    [addBot, content, currentCatalog],
  );

  const advanceQuiz = useCallback(
    (value) => {
      const question = content.quiz.questions[quizIndex];
      const option = question.options.find((o) => o.value === value);
      addUser(option ? option.label : value);

      const answers = { ...answersRef.current, [question.key]: value };
      answersRef.current = answers;

      const nextIndex = quizIndex + 1;
      if (nextIndex < content.quiz.questions.length) {
        setQuizIndex(nextIndex);
        addBot({ kind: "text", text: content.quiz.questions[nextIndex].prompt }, 500);
      } else {
        setView("result");
        finishQuiz(answers);
      }
    },
    [addBot, addUser, content, finishQuiz, quizIndex],
  );

  const trackMessage = useCallback(
    () => ({ kind: "links", text: content.links.trackText, links: ["track"] }),
    [content],
  );

  const humanMessage = useCallback(
    () => ({ kind: "links", text: content.links.humanText, links: ["whatsapp", "call"] }),
    [content],
  );

  const faqAnswer = useCallback(
    (key) => {
      if (key === "sizesPrices") {
        const cat = currentCatalog();
        const mins = cat.map((p) => p.effectiveMinPrice).filter((n) => n > 0);
        const maxs = cat.map((p) => p.maxPrice).filter((n) => n > 0);
        const min = mins.length ? Math.min(...mins) : 0;
        const max = maxs.length ? Math.max(...maxs) : 0;
        const text = content.faq.priceTemplate
          .replace("{min}", formatPrice(min, botLang))
          .replace("{max}", formatPrice(max, botLang));
        return { kind: "text", text };
      }
      if (key === "returns") {
        return { kind: "links", text: content.faq.answers.returns, links: ["whatsapp"] };
      }
      return { kind: "text", text: content.faq.answers[key] };
    },
    [botLang, content, currentCatalog],
  );

  const selectFaqTopic = useCallback(
    (key) => {
      const topic = content.faq.topics.find((t) => t.value === key);
      if (topic) addUser(topic.label);
      addBot(() => faqAnswer(key), 500);
    },
    [addBot, addUser, content, faqAnswer],
  );

  const handleQuickReply = useCallback(
    (value) => {
      switch (value) {
        case "__recommend":
          addUser(content.menu.recommend);
          startQuiz();
          return;
        case "__again":
          addUser(content.result.followups.again);
          startQuiz();
          return;
        case "__ask":
          addUser(content.menu.ask);
          setView("faq");
          addBot({ kind: "text", text: content.faq.prompt }, 400);
          return;
        case "__track":
          addUser(content.menu.track);
          addBot(trackMessage, 450);
          return;
        case "__human":
          addUser(content.menu.human);
          addBot(humanMessage, 450);
          return;
        case "__seeAll":
          addUser(content.result.followups.seeAll);
          addBot({ kind: "links", text: content.result.intro, links: ["seeAll"] }, 400);
          return;
        default:
          break;
      }

      if (view === "quiz") advanceQuiz(value);
      else if (view === "faq") selectFaqTopic(value);
    },
    [addBot, addUser, advanceQuiz, content, humanMessage, selectFaqTopic, startQuiz, trackMessage, view],
  );

  const handleUserText = useCallback(
    (raw) => {
      const text = (raw || "").trim();
      if (!text) return;
      addUser(text);

      const intent = matchIntent(text);
      switch (intent) {
        case "recommend":
          startQuiz();
          return;
        case "track":
          addBot(trackMessage, 450);
          return;
        case "human":
          addBot(humanMessage, 450);
          return;
        case "greeting":
          setView("menu");
          addBot({ kind: "text", text: content.greeting }, 400);
          return;
        case "thanks":
          addBot({ kind: "text", text: content.faq.thanks }, 400);
          return;
        case "fallback":
          setView("menu");
          addBot({ kind: "text", text: content.faq.fallback }, 450);
          return;
        default:
          setView("faq");
          addBot(() => faqAnswer(intent), 500);
      }
    },
    [addBot, addUser, content, faqAnswer, humanMessage, startQuiz, trackMessage],
  );

  /* ── History / archive controls ─────────────────────────────────────── */

  const newConversation = useCallback(() => {
    archiveCurrentToStore();
    freshConversation(botLang);
    setArchive(loadArchive());
    setArchivedView(null);
    setPanel("chat");
  }, [archiveCurrentToStore, botLang, freshConversation]);

  const changeLanguage = useCallback(
    (lang) => {
      if (lang === botLang) {
        setPanel("chat");
        setArchivedView(null);
        return;
      }
      archiveCurrentToStore();
      freshConversation(lang);
      setArchive(loadArchive());
      setArchivedView(null);
      setPanel("chat");
      setBotLang(lang);
    },
    [archiveCurrentToStore, botLang, freshConversation, setBotLang],
  );

  const showHistory = useCallback(() => {
    setArchive(loadArchive());
    setArchivedView(null);
    setPanel("history");
  }, []);

  const showChat = useCallback(() => {
    setArchivedView(null);
    setPanel("chat");
  }, []);

  const openArchived = useCallback((id) => {
    const conv = loadArchive().find((c) => c.id === id);
    if (conv) setArchivedView(conv);
  }, []);

  const removeArchived = useCallback((id) => {
    const next = deleteArchived(id);
    setArchive(next);
    setArchivedView((v) => (v && v.id === id ? null : v));
  }, []);

  /* Quick replies for the current step. */
  const quickReplies = (() => {
    if (view === "menu") {
      return [
        { value: "__recommend", label: content.menu.recommend, primary: true },
        { value: "__ask", label: content.menu.ask },
        { value: "__track", label: content.menu.track },
        { value: "__human", label: content.menu.human },
      ];
    }
    if (view === "quiz") return content.quiz.questions[quizIndex].options;
    if (view === "result") {
      return [
        { value: "__again", label: content.result.followups.again, primary: true },
        { value: "__seeAll", label: content.result.followups.seeAll },
        { value: "__human", label: content.result.followups.human },
      ];
    }
    if (view === "faq") {
      return [
        ...content.faq.topics,
        { value: "__recommend", label: content.menu.recommend, primary: true },
        { value: "__human", label: content.menu.human },
      ];
    }
    return [];
  })();

  return {
    content,
    messages,
    typing,
    quickReplies,
    catalogReady,
    handleQuickReply,
    handleUserText,
    // history
    panel,
    archive,
    archivedView,
    archivedContent: archivedView ? getChatbotContent(archivedView.botLang) : null,
    newConversation,
    changeLanguage,
    showHistory,
    showChat,
    openArchived,
    removeArchived,
  };
}
