// Applies src/content/productContent.ts to the products in DATABASE_URL.
//
//   npm run content:apply            dry run: prints what would change
//   npm run content:apply -- --apply writes it
//   npm run content:apply -- --apply --overwrite   also replaces existing text
//
// Running this is OPTIONAL. The same content already reaches the public pages
// as a fallback (see withEditorialContent in src/content/productContent.ts);
// writing it to the database only makes the text editable in the admin.
//
// By default only empty fields are filled, so copy written by hand in the
// admin is never lost. Writes go straight to the database, bypassing the
// admin API's cache invalidation, and the Data Cache persists across deploys,
// so the public pages pick the text up within the one-hour ISR backstop or
// immediately after any product is saved in the admin (that expires the
// products tag for the whole catalogue).
import { PrismaClient, Prisma } from "@prisma/client";
import { findProductContent } from "../src/content/productContent";
import { productDescription, productTitle } from "../src/lib/seo";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const OVERWRITE = args.has("--overwrite");

const isEmptyJson = (value: Prisma.JsonValue | null) =>
  value == null || (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0);

async function main() {
  const db = new PrismaClient();
  try {
    const products = await db.product.findMany({
      select: { id: true, name: true, slug: true, manufacturer: true, shortDesc: true, category: { select: { name: true } }, seoTitle: true, seoDesc: true, description: true, features: true, indications: true, specifications: true },
      orderBy: { name: "asc" },
    });

    let matched = 0;
    let changed = 0;
    const unmatched: string[] = [];
    // Products whose SEO copy was generated from their own name, manufacturer,
    // category and description, because no hand-written copy exists for them:
    // those with no content entry, and those matched only by a generic entry
    // (the dental chairs) that deliberately carries none.
    const generated: string[] = [];

    for (const product of products) {
      const content = findProductContent(product.name);
      if (content) matched += 1;
      else unmatched.push(product.name);

      const data: Prisma.ProductUpdateInput = {};
      if (content) {
        if (content.seoTitle && (OVERWRITE || !product.seoTitle?.trim())) data.seoTitle = content.seoTitle;
        if (content.seoDesc && (OVERWRITE || !product.seoDesc?.trim())) data.seoDesc = content.seoDesc;
        if (OVERWRITE || !product.description?.trim()) data.description = content.description;
        if (content.features && (OVERWRITE || product.features.length === 0)) data.features = content.features;
        if (content.indications && (OVERWRITE || product.indications.length === 0)) data.indications = content.indications;
        if (content.specifications && (OVERWRITE || isEmptyJson(product.specifications))) {
          // Merge so per-unit rows the admin already entered are kept.
          const existing = (product.specifications ?? {}) as Record<string, string>;
          data.specifications = OVERWRITE ? { ...existing, ...content.specifications } : { ...content.specifications, ...existing };
        }
      }

      // Anything still without SEO copy gets the same title and description the
      // public page would otherwise build on the fly (src/lib/seo.ts), written
      // down so it can be edited in the admin. Never replaces existing text,
      // even with --overwrite: there is nothing better to replace it with.
      const description = product.description?.trim() ? product.description : content?.description;
      const source = { ...product, description, seoTitle: null, seoDesc: null };
      const seoTitle = !product.seoTitle?.trim() && !data.seoTitle ? productTitle(source) : undefined;
      const seoDesc = !product.seoDesc?.trim() && !data.seoDesc ? productDescription(source) : undefined;
      if (seoTitle) data.seoTitle = seoTitle;
      if (seoDesc) data.seoDesc = seoDesc;
      if (seoTitle || seoDesc) {
        generated.push(`${product.name}\n    title: ${seoTitle ?? "(kept)"}\n    description: ${seoDesc ?? "(kept)"}`);
      }

      const fields = Object.keys(data);
      if (fields.length === 0) {
        console.log(`= ${product.name}: already complete`);
        continue;
      }
      changed += 1;
      console.log(`${APPLY ? "✓" : "~"} ${product.name} (${product.slug}): ${fields.join(", ")}`);
      if (APPLY) await db.product.update({ where: { id: product.id }, data });
    }

    console.log(`\n${products.length} products, ${matched} matched, ${changed} ${APPLY ? "updated" : "would change"}.`);
    if (unmatched.length > 0) {
      console.log(`\nNo content entry for ${unmatched.length}:\n  ${unmatched.join("\n  ")}`);
      console.log("\nThey still get a generated SEO title and description. For a full product description too, add a match entry to src/content/productContent.ts.");
    }
    if (generated.length > 0) {
      console.log(`\nSEO copy generated from the product's own details (${generated.length}):`);
      console.log(`  ${generated.join("\n  ")}`);
    }
    console.log(`\nAfter ${APPLY ? "this run" : "--apply"}, every product has an SEO title and description.`);
    if (!APPLY) console.log("\nDry run. Re-run with --apply to write.");
    else if (changed > 0) console.log("\nPublic pages refresh within an hour, or at once after you save any product in the admin.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
