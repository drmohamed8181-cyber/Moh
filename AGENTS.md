<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Compliance check on every change

Before building or shipping anything for MP MedPharma, check that it doesn't break a rule or guideline that applies to it, and tell the owner about any conflict before writing code. That includes:

- **Copyright and permissions**: only modify or brand (e.g. watermark) images and text the business owns or has permission for. LaserLocators has given written permission to use and modify its product photos; manufacturer and other sites' photos do not have that permission.
- **Trademarks**: manufacturer names and logos may describe products, but must not suggest the business is the manufacturer or an authorized dealer unless it is.
- **Google Search and Merchant Center**: structured data, sitemaps and product feeds must match what the page shows and use clean product images (no watermarks or promotional overlays).
- **Medical device selling**: no health claims beyond the manufacturer's labeling; follow FDA and other applicable rules for resale of refurbished devices.
- **Privacy**: customer and seller data (emails, phone numbers, serial numbers in photos) stays private; follow the existing patterns (e.g. seller photos use private Cloudinary delivery).
- **Platform terms**: Vercel, Supabase, Cloudinary, Stripe, Resend and any other service the site uses.
- **Accessibility**: images keep meaningful alt text; interactive elements work by keyboard.

When unsure, say so and recommend checking with the relevant party (lawyer, partner, platform docs) rather than guessing.
