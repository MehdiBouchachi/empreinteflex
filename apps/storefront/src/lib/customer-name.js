// Preserve the existing first_name / last_name database contract.
export function splitFullName(fullName) {
  const parts = String(fullName ?? "").trim().split(/\s+/);
  return { firstName: parts.shift() || "", lastName: parts.join(" ") || "-" };
}

export function fullNameFromDraft(draft) {
  if (typeof draft.fullName === "string") return draft.fullName;
  return [draft.firstName, draft.lastName]
    .filter((part) => typeof part === "string" && part.trim() && part.trim() !== "-")
    .map((part) => part.trim())
    .join(" ");
}
