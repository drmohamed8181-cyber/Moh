"use client";

import { useEffect } from "react";
import { trackContactClick } from "@/lib/analytics";

// Phone, email and WhatsApp links are spread across the header, footer,
// product pages and contact page. One delegated listener catches them all,
// including links added later, without touching each component.
export default function ContactClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) trackContactClick("phone");
      else if (href.startsWith("mailto:")) trackContactClick("email");
      else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) trackContactClick("whatsapp");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
