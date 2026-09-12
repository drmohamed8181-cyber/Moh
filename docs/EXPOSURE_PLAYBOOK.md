# Getting MP MedPharma in front of buyers

A working checklist for growing traffic to www.mpmedpharma.com. The code side
(sitemap, structured data, canonical URLs, caching, brand pages, search-intent
titles, analytics hooks) is done in the repository. Everything below is work
that happens **outside the code** and is what actually moves the numbers.

Work the sections in order. Each one unlocks the next.

## 1. Measure first (one afternoon)

You cannot improve what you cannot see. Today the site has no analytics at all.

1. **Google Search Console** – https://search.google.com/search-console
   - Add the property `https://www.mpmedpharma.com` (URL-prefix type).
   - Choose the *HTML tag* verification method, copy the `content="..."` value
     into the Vercel environment variable `GOOGLE_SITE_VERIFICATION`, redeploy,
     then click Verify.
   - Submit the sitemap: `https://www.mpmedpharma.com/sitemap.xml`.
   - Open *Pages* → look at "Why pages aren't indexed". Use *URL inspection →
     Request indexing* on the homepage, `/products`, `/brands`, every category
     page and your ten most important product pages. Do this once; Google
     rate-limits it.
   - Check back weekly: *Performance* shows the exact queries people typed.
     Those queries are your keyword list for step 3.
2. **Bing Webmaster Tools** – https://www.bing.com/webmasters
   - "Import from Google Search Console" does everything in one click. Bing
     also feeds DuckDuckGo and ChatGPT search.
   - Or verify with the meta tag and put the value in `BING_SITE_VERIFICATION`.
3. **Google Analytics 4** – https://analytics.google.com
   - Create a property and a web data stream for the domain, copy the
     Measurement ID (`G-…`) into `NEXT_PUBLIC_GA_MEASUREMENT_ID`, redeploy.
   - In GA4 mark the contact form, demo request and "Sell your product"
     submissions as key events. Traffic without inquiries is vanity.
4. **Vercel Web Analytics** (optional, free on Hobby): Vercel dashboard →
   project `moh` → Analytics → Enable. It shows referrers and top pages
   without cookies.

## 2. Be findable as a business, not just a website (one afternoon)

1. **Google Business Profile** – https://business.google.com
   - Create the listing for MP MedPharma at the New Jersey address, category
     "Medical equipment supplier", add phone, hours, website, logo and a few
     photos of real devices. This is the single biggest local-search lever and
     it is free. Ask every satisfied customer for a review here.
2. **LinkedIn company page** – ophthalmology practice managers, ASC
   administrators and biomedical engineers are on LinkedIn. Post one device
   arrival per week with a photo and a link to its product page.
3. **Consistent name / address / phone** everywhere: the site, Google Business
   Profile, LinkedIn, Facebook, directories. Mismatches lower trust.

## 3. Match what buyers actually search (ongoing, 30 minutes per product)

Nobody searches "premium medical equipment". They search
`alcon centurion for sale`, `used zeiss cirrus 5000 price`,
`ellex tango slt yag refurbished`. The code now builds titles that way
automatically, but the page still needs real text to rank:

For every product in `/admin/products`:
- **Full Description**: 150–300 words in your own words. Who uses it, what
  procedures, what generation/model year, what is included, condition,
  warranty. Copying the manufacturer brochure does not count – Google already
  has that page.
- **Specifications**: fill the table (laser wavelength, energy range, power,
  software version, dimensions). Spec queries are very common.
- **Features / Accessories / Indications**: at least a few bullets each.
- **SEO Title / SEO Description**: leave empty unless you want to override the
  generated ones. If you set them, keep the title under 60 characters and the
  description under 160.
- **Photos**: real photos of the actual unit beat stock renders, and Google
  Images is a real traffic source for equipment.

For every category in `/admin/categories`: write a two-sentence description
that names the device types and manufacturers in it.

## 4. Publish where the buyers already look (ongoing)

Secondhand ophthalmic equipment has its own marketplaces. Listings there are
both sales channels and links back to your site:

- DOTmed (dotmed.com) – the largest used-medical-equipment marketplace.
- LabX, MedWOW, Bimedis, eBay Business & Industrial.
- Manufacturer-agnostic directories: MedicalExpo, Thomasnet.
- Ophthalmology communities: ASCRS and AAO exhibitor directories, Ophthalmology
  Times / EyeWorld classifieds, Facebook groups for ophthalmic practice
  managers.

Always link the listing to the exact product page on mpmedpharma.com, never
just the homepage.

## 5. Content that earns visits over time (one piece per month)

Write for the questions your customers ask you on the phone. Examples:
- "Refurbished vs new phaco system: what actually differs?"
- "Alcon Centurion vs Infiniti: what changed"
- "What to check before buying a used excimer laser"
- "How much does a used OCT cost in 2026?"

Each one targets a real query, links to the relevant brand and product pages,
and gives other sites a reason to link to you. When you are ready for this,
ask for a `/guides` section in the site; the brand pages were built the same
way.

## 6. Turn visitors into inquiries

Traffic is only useful if it converts:
- Keep the newsletter and the product-digest email (already automated) going.
- Reply to inquiries the same day; add the WhatsApp number to Google Business
  Profile too.
- Fix the trust-bar copy on the homepage (`src/app/(shop)/page.tsx`): "FDA & CE
  certified", "ISO 13485", "24/7 clinical support", "same-day dispatch" came
  from the template. Replace with what is true; buyers of $50k lasers check.

## What "working" looks like

| Milestone | Where to check | Typical timing |
|---|---|---|
| Pages indexed | Search Console → Pages | 1–4 weeks after submitting the sitemap |
| Brand-name queries appear | Search Console → Performance → Queries | 2–6 weeks |
| Model-name queries with clicks | same | 2–4 months, faster with step 3 done |
| Inquiries attributed to organic search | GA4 → key events by source | 3–6 months |

Revisit this file every month, tick what is done, and note what changed in
Search Console. Growth here compounds; it does not spike.
