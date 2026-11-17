import Link from "next/link";

// Shown under every form where a visitor gives us their contact details
// (owner's requirement, Nov 17, 2026). Keep the wording in step with the
// "How We Use Your Information" section of /privacy.
export const CONSENT_TEXT =
  "By submitting your information, you agree that MP MedPharma may contact you about your request and send you future communications, including inventory updates. You can unsubscribe at any time using the link in our emails.";

export default function ConsentNotice({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <p className={`text-xs leading-relaxed ${dark ? "text-white/60" : "text-gray-500"} ${className}`}>
      {CONSENT_TEXT} See our{" "}
      <Link href="/privacy" className={`underline underline-offset-2 ${dark ? "hover:text-white" : "hover:text-gray-700"}`}>
        Privacy Policy
      </Link>
      .
    </p>
  );
}
