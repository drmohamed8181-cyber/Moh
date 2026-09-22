// Sets the stock of ophthalmology products from the partner's current list
// (laserlocators.com) in the products in DATABASE_URL.
//
//   npm run stock:sync             dry run: prints what would change
//   npm run stock:sync -- --apply  writes it
//
// The admin shows "Out of Stock" for any product whose stock is 0, and 0 is
// the default, so equipment added without typing a quantity looked sold out
// even though the partner still lists it. The rule this script applies:
//
//   - in the partner's list, stock 0  -> stock 1 (in stock)
//   - not in the partner's list       -> stock 0 (out of stock)
//
// A product already in stock keeps its quantity. Only ophthalmology products
// are touched: dental and anything else the partner does not supply are left
// alone. Visibility (isAvailable) is never changed; hiding a unit from the
// site stays a decision made in the admin.
//
// Matching is by model name: a product matches a partner page when the
// distinctive words of one slug all appear in the other (see findPartnerSlug).
// The dry run prints every pair and every product left unmatched, so check it
// before applying; a product the partner lists under a different model name
// can be fixed by renaming its slug or by setting its stock in the admin.
import { PrismaClient } from "@prisma/client";
import { NON_OPHTHALMOLOGY_CATEGORY_SLUGS } from "../src/lib/specialties";

const APPLY = process.argv.slice(2).includes("--apply");
const PARTNER_SITEMAP = "https://laserlocators.com/sitemap_index.xml";
// A broken or blocked fetch returns few or no URLs. Marking the whole
// catalogue out of stock on the strength of that would be worse than doing
// nothing, so stop instead.
const MIN_PARTNER_PRODUCTS = 10;

// Words that say what kind of listing it is rather than which model, and so
// cannot tell two units apart.
const GENERIC_WORDS = new Set([
  "refurbished", "used", "new", "system", "unit", "for", "sale", "the", "and", "with",
  "laser", "lasers", "ophthalmic", "equipment", "machine", "device",
]);

const tokens = (slug: string) =>
  slug.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (MP MedPharma stock sync)" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

const locs = (xml: string) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

/** The URL slugs of every product page in the partner's product sitemaps. */
async function partnerSlugs(): Promise<string[]> {
  const index = locs(await fetchText(PARTNER_SITEMAP));
  const productMaps = index.filter((url) => /product-sitemap\d*\.xml$/.test(url));
  if (productMaps.length === 0) throw new Error(`No product sitemap listed in ${PARTNER_SITEMAP}`);

  const slugs = new Set<string>();
  for (const map of productMaps) {
    for (const url of locs(await fetchText(map))) {
      const path = new URL(url).pathname.replace(/\/+$/, "");
      const slug = path.slice(path.lastIndexOf("/") + 1);
      if (slug) slugs.add(slug);
    }
  }
  return [...slugs];
}

const distinctive = (slug: string) => tokens(slug).filter((word) => !GENERIC_WORDS.has(word));

type PartnerProduct = { slug: string; words: string[] };

/**
 * The partner page for a product: the same slug, or else the page whose
 * distinctive words contain all of the product's or are all contained in the
 * product's (listings often add or drop a word like "excimer" or the brand).
 * At least two words must be shared (one, for a one-word product), so a page
 * named only by brand cannot claim every product of that brand. When several
 * qualify, the one sharing the most words wins.
 */
function findPartnerSlug(productSlug: string, partner: PartnerProduct[]): string | undefined {
  if (partner.some((p) => p.slug === productSlug)) return productSlug;
  const ours = new Set(distinctive(productSlug));
  if (ours.size === 0) return undefined;

  let best: { slug: string; shared: number } | undefined;
  for (const p of partner) {
    if (p.words.length === 0) continue;
    const shared = p.words.filter((word) => ours.has(word)).length;
    const qualifies = shared >= Math.min(2, ours.size) && (shared === ours.size || shared === p.words.length);
    if (qualifies && (!best || shared > best.shared)) best = { slug: p.slug, shared };
  }
  return best?.slug;
}

async function main() {
  const slugs = await partnerSlugs();
  console.log(`Partner lists ${slugs.length} products.\n`);
  if (slugs.length < MIN_PARTNER_PRODUCTS) {
    throw new Error(`Expected at least ${MIN_PARTNER_PRODUCTS} partner products; refusing to change stock.`);
  }
  const partner: PartnerProduct[] = slugs.map((slug) => ({ slug, words: [...new Set(distinctive(slug))] }));

  const db = new PrismaClient();
  try {
    const products = await db.product.findMany({
      where: { category: { slug: { notIn: NON_OPHTHALMOLOGY_CATEGORY_SLUGS } } },
      select: { id: true, name: true, slug: true, stockQty: true },
      orderBy: { name: "asc" },
    });

    const toInStock: typeof products = [];
    const toOutOfStock: typeof products = [];
    for (const product of products) {
      const match = findPartnerSlug(product.slug, partner);
      if (match) {
        console.log(`  listed      ${product.name} (${product.slug}) -> ${match}`);
        if (product.stockQty <= 0) toInStock.push(product);
      } else {
        console.log(`  NOT listed  ${product.name} (${product.slug})`);
        if (product.stockQty > 0) toOutOfStock.push(product);
      }
    }

    const verb = APPLY ? "Set" : "Would set";
    console.log(`\n${products.length} ophthalmology products checked.`);
    console.log(`${verb} in stock (1): ${toInStock.length}`);
    for (const p of toInStock) console.log(`  + ${p.name}`);
    console.log(`${verb} out of stock (0): ${toOutOfStock.length}`);
    for (const p of toOutOfStock) console.log(`  - ${p.name} (was ${p.stockQty})`);

    if (!APPLY) {
      console.log("\nDry run. Re-run with --apply to write.");
      return;
    }
    await db.$transaction([
      ...toInStock.map((p) => db.product.update({ where: { id: p.id }, data: { stockQty: 1 } })),
      ...toOutOfStock.map((p) => db.product.update({ where: { id: p.id }, data: { stockQty: 0 } })),
    ]);
    console.log("\nDone. The admin shows the new stock at once; public pages refresh within an hour, or at once after you save any product in the admin.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
