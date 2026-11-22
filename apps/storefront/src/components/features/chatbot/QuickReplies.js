"use client";

/* Tappable option chips for the current conversation step. */
export default function QuickReplies({ options, onSelect, disabled }) {
  if (!options?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option.value)}
          className={[
            "rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200",
            "active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
            option.primary
              ? "border-blue-900 bg-blue-900 text-white hover:bg-blue-800"
              : "border-blue-200 bg-white text-blue-900 hover:bg-blue-50",
          ].join(" ")}
        >
          {/* <bdi> isolates bidi: "90 x 190" stays LTR, Arabic labels stay RTL */}
          <bdi>{option.label}</bdi>
        </button>
      ))}
    </div>
  );
}
