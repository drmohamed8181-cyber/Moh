"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FileDown, Loader2, X } from "lucide-react";
import Input from "@/components/ui/Input";
import EmailSuggestion from "@/components/ui/EmailSuggestion";
import type { Catalog } from "@/lib/catalogs";
import { catalogHref, type CatalogLinkSource } from "@/lib/catalogDownloads";

// A catalog link on the website. Before the PDF opens, the visitor gives their
// name, email and clinic, which are saved as a lead (see
// src/app/api/catalog-request/route.ts). Someone who has already filled the
// form in this browser goes straight to the PDF.
//
// It stays a real <a href> to the PDF, so the link still works without
// JavaScript, and printed QR codes and shared links (which go straight to
// /catalog/<file>.pdf) never see the form.

const STORAGE_KEY = "mp-catalog-requested";

function alreadyRequested(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberRequested() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private windows can refuse storage; the visitor just sees the form again next time.
  }
}

export default function CatalogRequestLink({
  catalog,
  source,
  className,
  children,
}: {
  catalog: Catalog;
  source: CatalogLinkSource;
  className?: string;
  children: ReactNode;
}) {
  const href = catalogHref(catalog.href, source);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setError(null);
      if (status === "done") setStatus("idle");
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [status]);

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modified clicks (new window, download) and returning visitors through.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (alreadyRequested()) return;
    e.preventDefault();
    dialogRef.current?.showModal();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/catalog-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, organization, catalog: catalog.specialty, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      rememberRequested();
      setStatus("done");
    } catch {
      setError("Couldn't reach the server. Please check your connection and try again.");
      setStatus("idle");
    }
  };

  const titleId = `${formId}-title`;

  return (
    <>
      <a href={href} target="_blank" rel="noopener" onClick={onLinkClick} className={className}>
        {children}
      </a>

      {/* m-auto: the global CSS reset sets margin: 0 on every element, which
          pins a modal <dialog> to the top-left instead of centering it. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/60 text-left"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1">Free PDF catalog</p>
              <h2 id={titleId} className="text-xl font-bold text-slate-900">{catalog.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {status === "done" ? (
            <div aria-live="polite">
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Thank you, {name.split(" ")[0]}. Your catalog is ready, and we&apos;ve also emailed you the link to keep.
              </p>
              <a
                href={href}
                target="_blank"
                rel="noopener"
                onClick={() => dialogRef.current?.close()}
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-primary-700 text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
              >
                <FileDown size={16} aria-hidden="true" /> Open the catalog (PDF)
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Tell us who you are and we&apos;ll open the catalog and email you a copy. It&apos;s built from our live
                inventory, so the link always shows what&apos;s available.
              </p>
              <div className="space-y-4">
                <Input
                  id={`${formId}-name`}
                  label="Your name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div>
                  <Input
                    id={`${formId}-email`}
                    label="Work email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <EmailSuggestion email={email} onAccept={setEmail} />
                </div>
                <Input
                  id={`${formId}-org`}
                  label="Clinic or hospital"
                  autoComplete="organization"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
              {error && (
                <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-primary-700 text-white hover:bg-primary-800 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600"
              >
                {status === "sending" ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <FileDown size={16} aria-hidden="true" />}
                Get the catalog
              </button>
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                We use your details only to send the catalog and follow up about equipment. See our{" "}
                <a href="/privacy" className="underline underline-offset-2 hover:text-slate-600">privacy policy</a>.
              </p>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
