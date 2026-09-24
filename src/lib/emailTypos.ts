// Suggests a fix for common email domain typos ("gmial.com", "gmail.coms").
// Only ever a hint: the customer decides, and unusual addresses are never blocked.

const COMMON_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com",
  "live.com", "msn.com", "me.com", "mac.com", "comcast.net", "verizon.net", "att.net",
  "sbcglobal.net", "bellsouth.net", "cox.net", "charter.net", "protonmail.com", "proton.me",
  "ymail.com", "rocketmail.com", "mail.com", "gmx.com", "email.com", "zoho.com", "yandex.com",
  "hotmail.co.uk", "yahoo.co.uk", "yahoo.ca", "outlook.sa", "hotmail.fr", "yahoo.fr",
];

const TLD_FIXES: Record<string, string> = {
  coms: "com", comm: "com", con: "com", cmo: "com", ocm: "com", vom: "com", xom: "com",
  cim: "com", copm: "com", colm: "com", "c0m": "com", cpm: "com",
  ner: "net", nte: "net", met: "net", bet: "net",
  ogr: "org", orgg: "org", prg: "org",
};

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

export function suggestEmail(email: string): string | null {
  const at = email.trim().lastIndexOf("@");
  if (at < 1) return null;
  const local = email.trim().slice(0, at);
  const domain = email.trim().slice(at + 1).toLowerCase();
  if (!domain.includes(".") || COMMON_DOMAINS.includes(domain)) return null;

  // Close to a well-known provider: "gmial.com", "yaho.com", "gmail.co".
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const known of COMMON_DOMAINS) {
    const d = distance(domain, known);
    if (d < bestDistance) {
      best = known;
      bestDistance = d;
    }
  }
  if (best && bestDistance <= (domain.length >= 9 ? 2 : 1)) return `${local}@${best}`;

  // Otherwise fix just an obviously wrong ending: "clinic.coms" → "clinic.com".
  const dot = domain.lastIndexOf(".");
  const fixedTld = TLD_FIXES[domain.slice(dot + 1)];
  if (fixedTld) return `${local}@${domain.slice(0, dot + 1)}${fixedTld}`;

  return null;
}
