// JSON.stringify does not escape "<", so a value containing "</script>" can
// break out of the script tag. Next.js's own JSON-LD guide recommends this
// exact escape: https://nextjs.org/docs/app/guides/json-ld
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
