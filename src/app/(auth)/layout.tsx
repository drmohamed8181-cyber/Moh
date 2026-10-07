import type { Metadata } from "next";

// Sign-in and password forms have nothing to rank for, and with no canonical of
// their own Google reported them as "Duplicate without user-selected canonical".
// Keeping them out of the index removes that noise; links on them still count.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
