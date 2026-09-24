"use client";

import { suggestEmail } from "@/lib/emailTypos";
import { cn } from "@/lib/utils";

/** "Did you mean …?" under an email field. Clicking it fills in the suggestion. */
export default function EmailSuggestion({
  email,
  onAccept,
  dark = false,
}: {
  email: string;
  onAccept: (email: string) => void;
  dark?: boolean;
}) {
  const suggestion = suggestEmail(email);
  return (
    <p aria-live="polite" className={cn("text-xs", suggestion && "mt-1.5", dark ? "text-white/80" : "text-amber-700")}>
      {suggestion && (
        <>
          Did you mean{" "}
          <button
            type="button"
            onClick={() => onAccept(suggestion)}
            className={cn("font-semibold underline underline-offset-2 rounded focus:outline-none focus:ring-2", dark ? "text-gold-400 focus:ring-gold-400" : "text-amber-800 focus:ring-amber-500")}
          >
            {suggestion}
          </button>
          ?
        </>
      )}
    </p>
  );
}
