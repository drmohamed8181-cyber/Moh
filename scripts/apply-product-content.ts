// Applies src/content/productContent.ts to the products in DATABASE_URL.
//
//   npm run content:apply            dry run: prints what would change
//   npm run content:apply -- --apply writes it
//   npm run content:apply -- --apply --overwrite   also replaces existing text
//
// By default only empty fields are filled, so copy written by hand in the
// admin is never lost. Writes go straight to the database, bypassing the
// admin API's cache invalidation, and the Data Cache persists across deploys,
// so the public pages pick the text up within the one-hour ISR backstop or
// immediately after any product is saved in the admin (that expires the
// products tag for the whole catalogue).
import { PrismaClient, Prisma } from "@prisma/client";
import { PRODUCT_CONTENT, type ProductContent } from "../src/content/productContent";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const OVERWRITE = args.has("--overwrite");

const normalise = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

function findContent(name: string): ProductContent | undefined {
  const key = normalise(name);
  return PRODUCT_CONTENT.find((entry) => entry.match.every((keyword) => key.includes(normalise(keyword))));
}

const isEmptyJson = (value: Prisma.JsonValue | null) =>
  value == null || (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0);

async function main() {
  const db = new PrismaClient();
  try {
    const products = await db.product.findMany({
      select: { id: true, name: true, slug: true, description: true, features: true, indications: true, specifications: true },
      orderBy: { name: "asc" },
    });

    let matched = 0;
    let changed = 0;
    const unmatched: string[] = [];

    for (const product of products) {
      const content = findContent(product.name);
      if (!content) {
        unmatched.push(product.name);
        continue;
      }
      matched += 1;

      const data: Prisma.ProductUpdateInput = {};
      if (OVERWRITE || !product.description?.trim()) data.description = content.description;
      if (content.features && (OVERWRITE || product.features.length === 0)) data.features = content.features;
      if (content.indications && (OVERWRITE || product.indications.length === 0)) data.indications = content.indications;
      if (content.specifications && (OVERWRITE || isEmptyJson(product.specifications))) {
        // Merge so per-unit rows the admin already entered are kept.
        const existing = (product.specifications ?? {}) as Record<string, string>;
        data.specifications = OVERWRITE ? { ...existing, ...content.specifications } : { ...content.specifications, ...existing };
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
      console.log("\nAdd a match entry to src/content/productContent.ts for each, or write them in the admin.");
    }
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
