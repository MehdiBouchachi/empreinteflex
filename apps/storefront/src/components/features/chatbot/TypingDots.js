"use client";

import { IoBedOutline } from "react-icons/io5";

/* Bot "typing…" indicator — matches the bot bubble styling. */
export default function TypingDots() {
  return (
    <div className="flex items-end gap-2">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-900 text-white">
        <IoBedOutline className="h-4 w-4" />
      </span>
      <div className="flex items-center gap-1 rounded-md border border-blue-100 bg-white px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-blue-300"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
          />
        ))}
      </div>
    </div>
  );
}
