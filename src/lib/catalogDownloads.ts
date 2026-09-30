// Counts downloads of the PDF catalogs (src/app/catalog/[file]/route.ts) for
// the admin dashboard.
//
// What counts as a download: a GET for the whole file by something that looks
// like a person. Left out are link-preview and crawler fetches (WhatsApp,
// iMessage, Googlebot and the like fetch a shared link on their own), browser
// prefetches, and the follow-up byte-range requests a PDF viewer makes while
// scrolling, which would otherwise count one view several times.
//
// Nothing personal is stored: no IP address, user agent or account. See the
// CatalogDownload model in prisma/schema.prisma.
import { safeDb } from "@/lib/prisma";
import type { CatalogSpecialty } from "@/lib/publicData";

// Where on the website a catalog link sits, passed as ?src= on the link. A
// request without one came from a printed QR code or a link someone shared.
export const CATALOG_LINK_SOURCES = ["home", "header", "catalogs", "categories", "category", "products", "footer"] as const;
export type CatalogLinkSource = (typeof CATALOG_LINK_SOURCES)[number];
const DIRECT = "direct";

export const SOURCE_LABELS: Record<string, string> = {
  home: "Homepage banner",
  header: "Header link",
  catalogs: "Catalogs page",
  categories: "Categories page",
  category: "A category page",
  products: "Products listing",
  footer: "Footer",
  [DIRECT]: "QR code or shared link",
};

/** The href for a catalog link placed at `source` on the website. */
export function catalogHref(href: string, source: CatalogLinkSource): string {
  return `${href}?src=${source}`;
}

const BOT_AGENT =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|skype|discord|embedly|curl|wget|python|go-http|headless|lighthouse|monitor/i;

/** Whether this request is a person fetching the catalog, as opposed to a bot, prefetch or range request. */
export function isCountableDownload(req: Request): boolean {
  if (req.method !== "GET") return false;
  const purpose = `${req.headers.get("purpose") ?? ""} ${req.headers.get("sec-purpose") ?? ""}`;
  if (/prefetch|prerender/i.test(purpose)) return false;
  const range = req.headers.get("range");
  if (range && !/^bytes=0-/i.test(range.trim())) return false;
  const agent = req.headers.get("user-agent") ?? "";
  return agent !== "" && !BOT_AGENT.test(agent);
}

/** Records one download. Never throws: a failed count must not fail the download. */
export async function recordCatalogDownload(req: Request, catalog: CatalogSpecialty): Promise<void> {
  const src = new URL(req.url).searchParams.get("src") ?? "";
  const source = (CATALOG_LINK_SOURCES as readonly string[]).includes(src) ? src : DIRECT;
  // Vercel sets this from the visitor's IP; only the two-letter country is kept.
  const country = req.headers.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null;
  await safeDb((db) => db.catalogDownload.create({ data: { catalog, source, country } }));
}

export type CatalogDownloadStats = {
  total: number;
  last7Days: number;
  last30Days: number;
  byCatalog: { catalog: string; total: number; last30Days: number }[];
  bySource: { source: string; label: string; total: number }[];
};

/** Download counts for the admin dashboard, or null when the database can't be read. */
export async function getCatalogDownloadStats(): Promise<CatalogDownloadStats | null> {
  const day = 24 * 60 * 60 * 1000;
  const since7 = new Date(Date.now() - 7 * day);
  const since30 = new Date(Date.now() - 30 * day);
  const result = await safeDb(async (db) => {
    const [total, last7Days, last30Days, byCatalog, byCatalog30, bySource] = await Promise.all([
      db.catalogDownload.count(),
      db.catalogDownload.count({ where: { createdAt: { gte: since7 } } }),
      db.catalogDownload.count({ where: { createdAt: { gte: since30 } } }),
      db.catalogDownload.groupBy({ by: ["catalog"], _count: { _all: true } }),
      db.catalogDownload.groupBy({ by: ["catalog"], where: { createdAt: { gte: since30 } }, _count: { _all: true } }),
      db.catalogDownload.groupBy({ by: ["source"], _count: { _all: true } }),
    ]);
    return { total, last7Days, last30Days, byCatalog, byCatalog30, bySource };
  });
  if (!result) return null;
  return {
    total: result.total,
    last7Days: result.last7Days,
    last30Days: result.last30Days,
    byCatalog: result.byCatalog.map((row) => ({
      catalog: row.catalog,
      total: row._count._all,
      last30Days: result.byCatalog30.find((r) => r.catalog === row.catalog)?._count._all ?? 0,
    })),
    bySource: result.bySource
      .map((row) => ({ source: row.source, label: SOURCE_LABELS[row.source] ?? row.source, total: row._count._all }))
      .sort((a, b) => b.total - a.total),
  };
}
