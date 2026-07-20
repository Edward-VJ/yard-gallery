# YG-2: Scrape absolutely everything from yard.gallery

## Goal
A complete local archive of the current site: every page (Lithuanian AND English versions), all text, every image at the highest resolution WordPress has, the Sunkūs Paminklai book pages, and metadata — organized so later tickets can consume it without ever touching WordPress again.

## HARD CONSTRAINT — read `plan/qr-locked-urls.md` first
The "Virtuali galerija" is NOT one page with a bunch of images — it's a hub/index page linking to **~25 individual artwork pages, each its own real WordPress page at its own exact slug** (e.g. `/nijoles-katinas/`), plus a 6-page "Paslapčių kambariai" mini-narrative (`/pirmasis-kambarys/` … `/sestasis-kambarys/`), plus `/senoji-informacine-lenta/`. This scrape must capture every one of those as its own page record, not flatten them into one gallery blob. Cross-reference the final inventory against `plan/qr-locked-urls.md` — every path listed there must appear in `urls.json`; anything listed there but NOT found live must be flagged loudly (don't silently drop it, don't silently invent it either — surface it for the human).

## Key insight
WordPress pages embed downscaled copies (`foo-1024x768.jpg`). The original upload usually exists at the same URL without the `-WxH` suffix (`foo.jpg`). Always attempt the suffix-stripped URL first — this is a free quality win before any AI upscaling. Also try the REST API: `https://yard.gallery/wp-json/wp/v2/media?per_page=100&page=N` lists the media library with `source_url` of originals; `wp-json/wp/v2/pages` and `/posts` give raw content HTML — this should enumerate all ~35 individual pages by slug cleanly, since they're already separate WP posts/pages, not a hand-rolled single-page gallery.

## Steps
1. Create `raw/` at repo root (gitignored): `raw/pages/`, `raw/images/`, `raw/book/`, `raw/meta/`.
2. Enumerate pages: fetch `https://yard.gallery/sitemap.xml` (and `wp-sitemap.xml`); also crawl nav links from the homepage AND from the Virtuali galerija hub page (which links out to every individual artwork) AND from the Paslapčių kambariai hub (which links out to its 6 rooms). Cross-check against every exact path in `plan/qr-locked-urls.md` (both tiers) to confirm full coverage — treat that file as the checklist, not just a nice-to-have reference. Record every URL found, with its language, in `raw/meta/urls.json`.
3. Write a Python or Node scraper (save it in `scripts/scrape.mjs`) that for each page (including every individual artwork page, every room page, the hub pages, history, rules, home) saves: full HTML (`raw/pages/<slug>.html`), extracted main-content text (`raw/pages/<slug>.txt`), and a JSON record (title, exact slug, language, image URLs in order, captions/alt text).
4. Query the WP REST API endpoints above; save all JSON to `raw/meta/`. If the API is disabled, fall back to HTML scraping only.
5. Download every image: for each image URL, strip any `-\d+x\d+` suffix and try that first; fall back to the embedded URL. Save with original filenames into `raw/images/`, and write `raw/meta/images.json` mapping: filename → source page, caption/alt (LT+EN if available), original URL, resolution, filesize.
6. Sunkūs Paminklai: this page's slug is NOT in `plan/qr-locked-urls.md` (added to the site after that document was written — treat its exact URL as Tier 1/QR-critical by default per the human's caution, unless later told otherwise). Find it via the nav/sitemap crawl, record its exact slug prominently in `raw/meta/urls.json` and flag it in the inventory. Capture every book page image in reading order into `raw/book/001.jpg …`; record the ordering and any accompanying text in `raw/meta/book.json`.
7. Also save: site title/tagline, footer text, contact email, PayPal donation link/button target, favicon, any og:image or meta descriptions.
8. Produce `raw/meta/INVENTORY.md`: page count (expect ~35+ individual pages, not a handful), image count, per-image resolutions (flag everything below ~2000px on the long edge — those are upscale candidates for YG-3), anything that failed to download, AND an explicit checklist section cross-referencing every path in `plan/qr-locked-urls.md` against what was actually found (✅ found / ❌ missing — zero tolerance for a silent ❌).
9. Sanity check with the human: show INVENTORY.md (especially the QR-URL cross-reference checklist) and a handful of the largest images to confirm the archive looks complete before closing.

## Acceptance criteria
- Every nav-reachable page saved in both languages; zero broken image downloads (or failures documented).
- Every single path in `plan/qr-locked-urls.md` (both tiers) confirmed present in `urls.json` with its exact slug intact — this is checked explicitly, not assumed.
- The Sunkūs Paminklai book's exact slug discovered and recorded.
- `images.json` maps every image to its page, caption, and resolution.
- Book pages captured in correct order.
- Backup of `raw/` copied somewhere outside the repo folder (e.g. `F:\backups\yard_gallery_raw\`).
