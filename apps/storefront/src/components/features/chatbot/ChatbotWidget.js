"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { getChatbotContent } from "./chatbotContent";
import ChatLauncher from "./ChatLauncher";
import ChatWindow from "./ChatWindow";

/* Global recommendation chatbot. Mounted once in the [local] layout.
   `local` seeds the bot's language; the user can switch it inside the window. */
export default function ChatbotWidget({ local = "fr" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [botLang, setBotLang] = useState(local);

  const content = getChatbotContent(botLang);

  return (
    <>
      <ChatLauncher
        isOpen={isOpen}
        onToggle={() => setIsOpen((v) => !v)}
        label={content.launcherLabel}
      />

      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            key="chat-window"
            botLang={botLang}
            onChangeLang={setBotLang}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
