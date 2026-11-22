"use client";

import { IoBedOutline } from "react-icons/io5";

/* One chat line. Bot bubbles carry a small brand avatar; direction is handled
   by the parent's `dir`, so justify-start/end map to the correct side in RTL. */
export default function MessageBubble({ role, children }) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
          <IoBedOutline className="h-4 w-4" />
        </span>
      )}
      <div
        className={[
          "max-w-[85%] whitespace-pre-line rounded-md px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-blue-900 text-white shadow-sm"
            : "border border-blue-100 bg-white text-slate-800 shadow-sm",
        ].join(" ")}
      >
        {/* isolate bidi so "180 x 200" / prices read correctly in RTL and LTR */}
        <bdi>{children}</bdi>
      </div>
    </div>
  );
}
