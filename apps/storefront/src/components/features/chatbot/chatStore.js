/* ────────────────────────────────────────────────────────────────────────
   Chatbot conversation persistence (localStorage).

   • The active conversation survives closing the widget AND reloading the page.
   • Finished conversations are archived (newest first, capped) so the user can
     browse their history. All message payloads are plain JSON (text, links,
     normalized product objects) so they serialize cleanly.
──────────────────────────────────────────────────────────────────────────── */

const CURRENT_KEY = "ef_chat_current_v1";
const ARCHIVE_KEY = "ef_chat_archive_v1";
const ARCHIVE_CAP = 30;

function safeRead(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function hasUserMessage(conversation) {
  return Boolean(conversation?.messages?.some((m) => m.role === "user"));
}

export function loadCurrent() {
  return safeRead(CURRENT_KEY);
}

export function saveCurrent(conversation) {
  if (conversation?.messages?.length) safeWrite(CURRENT_KEY, conversation);
}

export function clearCurrent() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CURRENT_KEY);
  } catch {
    /* ignore */
  }
}

export function loadArchive() {
  const list = safeRead(ARCHIVE_KEY);
  return Array.isArray(list) ? list : [];
}

/* Push a finished conversation to the archive (skips empty / greeting-only). */
export function archiveConversation(conversation) {
  if (!hasUserMessage(conversation)) return loadArchive();
  const entry = {
    id: conversation.id,
    startedAt: conversation.startedAt,
    endedAt: Date.now(),
    botLang: conversation.botLang,
    messages: conversation.messages,
  };
  const next = [entry, ...loadArchive().filter((c) => c.id !== conversation.id)].slice(
    0,
    ARCHIVE_CAP,
  );
  safeWrite(ARCHIVE_KEY, next);
  return next;
}

export function deleteArchived(id) {
  const next = loadArchive().filter((c) => c.id !== id);
  safeWrite(ARCHIVE_KEY, next);
  return next;
}
