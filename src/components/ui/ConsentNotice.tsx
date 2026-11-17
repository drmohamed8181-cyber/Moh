"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Shown under every form where a visitor gives us their contact details
// (owner's requirement, Nov 17, 2026). Keep the wording in step with the
// "How We Use Your Information" section of /privacy.
//
// Visitors from the EU, EEA, UK and Switzerland (see src/lib/euCountries.ts)
// need an explicit opt-in for marketing email, so they get an unticked
// "inventory updates" box instead of the notice-only wording. Ticking it adds
// them to the newsletter list (the list inventory updates go to) when the
// surrounding form is submitted. Newsletter forms pass `newsletter`: signing
// up is itself the opt-in.
export const CONSENT_TEXT =
  "By submitting your information, you agree that MP MedPharma may contact you about your request and send you future communications, including inventory updates. You can unsubscribe at any time using the link in our emails.";

const OPT_IN_TEXT =
  "By submitting your information, you agree that MP MedPharma may contact you about your request. We will only send inventory updates if you tick the box.";

let optInRegion: Promise<boolean> | null = null;
function needsOptIn(): Promise<boolean> {
  if (!optInRegion) {
    optInRegion = fetch("/api/geo")
      .then((res) => (res.ok ? res.json() : { optIn: false }))
      .then((data) => Boolean(data?.optIn))
      .catch(() => false);
  }
  return optInRegion;
}

export default function ConsentNotice({
  dark = false,
  newsletter = false,
  className = "",
}: {
  dark?: boolean;
  newsletter?: boolean;
  className?: string;
}) {
  const [optInRegionVisitor, setOptInRegionVisitor] = useState(false);
  const [checked, setChecked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const checkedRef = useRef(false);
  useEffect(() => {
    checkedRef.current = checked;
  }, [checked]);

  useEffect(() => {
    if (newsletter) return;
    let active = true;
    needsOptIn().then((value) => active && setOptInRegionVisitor(value));
    return () => {
      active = false;
    };
  }, [newsletter]);

  // On submit of the surrounding form, subscribe the visitor if they ticked the box.
  useEffect(() => {
    if (!optInRegionVisitor) return;
    const form = ref.current?.closest("form");
    if (!form) return;
    const onSubmit = () => {
      if (!checkedRef.current) return;
      const value = (selector: string) => (form.querySelector(selector) as HTMLInputElement | null)?.value?.trim() || undefined;
      const email = value('input[type="email"]');
      if (!email) return;
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: value('input[autocomplete="name"]') }),
      }).catch(() => {});
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [optInRegionVisitor]);

  const muted = dark ? "text-white/60" : "text-gray-500";
  const showBox = optInRegionVisitor && !newsletter;

  return (
    <div ref={ref} className={className}>
      {showBox && (
        <label className={`flex items-start gap-2 text-sm mb-2 ${dark ? "text-white/80" : "text-gray-700"}`}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          <span>Yes, email me inventory updates (optional). You can unsubscribe at any time.</span>
        </label>
      )}
      <p className={`text-xs leading-relaxed ${muted}`}>
        {showBox ? OPT_IN_TEXT : CONSENT_TEXT} See our{" "}
        <Link href="/privacy" className={`underline underline-offset-2 ${dark ? "hover:text-white" : "hover:text-gray-700"}`}>
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
