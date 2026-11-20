"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import ContactClickTracker from "@/components/analytics/ContactClickTracker";

// The owner's own visits (checking messages in /admin, browsing his product
// pages) were showing up in Google Analytics as customers. Any browser that
// opens an /admin page is remembered as internal, and from then on that
// browser never loads Google Analytics, on admin or public pages.
//
// `ga-disable-<id>` is Google's documented opt-out switch: it also stops hits
// from a tag that loaded before the browser was marked (e.g. a public page
// opened first, then a client-side navigation into /admin).
const INTERNAL_KEY = "mpmp_internal_traffic";

function readInternalFlag(): boolean {
  try {
    return window.localStorage.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

function markInternal() {
  try {
    window.localStorage.setItem(INTERNAL_KEY, "1");
  } catch {
    // Storage blocked (private mode): the /admin path check still applies.
  }
}

export default function SiteAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  // null until checked in the browser, so GA never loads before we know.
  const [internal, setInternal] = useState<boolean | null>(null);

  useEffect(() => {
    const onAdmin = pathname?.startsWith("/admin") ?? false;
    if (onAdmin) markInternal();
    const isInternal = onAdmin || readInternalFlag();
    if (isInternal) {
      (window as unknown as Record<string, unknown>)[`ga-disable-${gaId}`] = true;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is browser-only, so the decision can only be made after mount.
    setInternal(isInternal);
  }, [pathname, gaId]);

  if (internal !== false) return null;

  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      <ContactClickTracker />
    </>
  );
}
