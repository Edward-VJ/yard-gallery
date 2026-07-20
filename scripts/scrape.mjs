// Archives everything from yard.gallery into raw/ before the WordPress site
// is decommissioned. See plan (yard-gallery-plan repo, 02-scrape.md) and
// content/qr-locked-urls.md for why exact slugs matter here.
import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "raw");
const UA = "Mozilla/5.0 (compatible; yard-gallery-archive/1.0; +https://github.com/Edward-VJ/yard-gallery)";
const BASE = "https://yard.gallery";

// Corrections discovered live on 2026-07-20 (see INVENTORY.md discrepancies section):
// - "Šiaudinis sodas" is QR-locked at /siaudinis-sodas/ per the source docx, but that
//   path 404s live today. The actual live page is /sodas/ (title "Sodas", content
//   matches the straw-garden installation exactly). Both slugs are archived.
// - "Ikos Grinbergo portretas" is QR-locked at /ikos-grinbergo-portretas/ (bare) per
//   the docx. Live, that bare path 301-redirects to /ikos-grinbergo-portretas-1/.
//   -1 and -2 are two DIFFERENT artworks (memorial inscription vs. a love-story
//   mural), not duplicates. All three slugs are archived; the bare slug's content
//   is treated as identical to -1 per the live redirect.
const LT_SLUGS = new Set([
  "", // homepage
  "nijoles-katinas",
  "kaimynes-ponios-kazimieros-portretas",
  "kaimynu-sauliaus-ir-ritmos-portretai",
  "imagine",
  "saugi-kaimynyste",
  "juodasis-namas",
  "sapnu-siuvykla",
  "menininko-zano-hoffmano-portretas",
  "petriuko-portretas",
  "elizos-ozeskienes-portretas",
  "melynasis-namas",
  "siaudinis-sodas", // QR doc slug — 404s live, see correction note above
  "sodas", // actual live slug for the same artwork
  "paslapciu-kambariai",
  "baltasis-namas",
  "jokubo-grinbergo-namai",
  "vaiku-akcija",
  "ikos-grinbergo-portretas", // QR doc slug — 301s live to -1, see correction note above
  "ikos-grinbergo-portretas-1",
  "ikos-grinbergo-portretas-2",
  "ditos-ir-judo-zupaviciu-portretas",
  "mimo-portretas",
  "levo-tolstojaus-portretas",
  "tomo-ir-jono-portretas",
  "kaimynes-nijoles-teta",
  "kaimynes-brones-portretas",
  "gyvybes-medis",
  "senoji-informacine-lenta",
  "lankymo-laikas-ir-taisykles",
  "istorija",
  "kiemo-galerija-virtuali-galerija",
  "pirmasis-kambarys",
  "antrasis-kambarys",
  "treciasis-kambarys",
  "ketvirtasis-kambarys",
  "penktasis-kambarys",
  "sestasis-kambarys",
  "sunkus-paminklai", // the book — Tier 0 in the QR doc, no EN pair found
]);

const BOOK_SLUG = "sunkus-paminklai";

function slugFromUrl(url) {
  const u = new URL(url);
  return u.pathname.replace(/^\/|\/$/g, "");
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return await res.text();
}

async function fetchStatus(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      headers: { "User-Agent": UA },
    });
    return { status: res.status, location: res.headers.get("location") };
  } catch (e) {
    return { status: 0, location: null, error: String(e) };
  }
}

async function fetchSitemapUrls() {
  const xml = await fetchText(`${BASE}/sitemap.xml`);
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls = [];
  $("url > loc, sitemap > loc").each((_, el) => urls.push($(el).text().trim()));
  return urls;
}

// Simple concurrency limiter — no extra dependency needed for this.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function extractText($) {
  const parts = [];
  $(".entry-content")
    .find("p, h1, h2, h3, h4, li, figcaption, blockquote")
    .each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t) parts.push(t);
    });
  return parts.join("\n\n");
}

function extractImages($, pageUrl) {
  const images = [];
  $(".entry-content img").each((_, el) => {
    const $el = $(el);
    const orig = $el.attr("data-orig-file");
    const src = $el.attr("src");
    const url = orig || src;
    if (!url) return;
    const alt = $el.attr("alt") || "";
    const width = $el.attr("data-orig-size")
      ? Number($el.attr("data-orig-size").split(",")[0])
      : Number($el.attr("width")) || null;
    const height = $el.attr("data-orig-size")
      ? Number($el.attr("data-orig-size").split(",")[1])
      : Number($el.attr("height")) || null;
    // figcaption sibling, if the image is wrapped in a <figure>
    const caption = $el.closest("figure").find("figcaption").first().text().trim() || null;
    images.push({ url, alt, caption, width, height, sourcePage: pageUrl });
  });
  return images;
}

async function scrapePage(url) {
  const slug = slugFromUrl(url) || "index";
  const html = await fetchText(url);
  const $ = cheerio.load(html);

  const rawTitle = $("title").first().text();
  const title = rawTitle.replace(/\s*[–-]\s*Kiemo Galerija\s*$/, "").trim();
  const language = LT_SLUGS.has(slugFromUrl(url)) ? "lt" : "en";
  const text = extractText($);
  const images = extractImages($, url);

  await fs.writeFile(path.join(RAW, "pages", `${slug}.html`), html, "utf8");
  await fs.writeFile(path.join(RAW, "pages", `${slug}.txt`), text, "utf8");

  return { url, slug, language, title, imageCount: images.length, images };
}

function imageFilename(url) {
  return decodeURIComponent(new URL(url).pathname.split("/").pop());
}

async function downloadImage(url, destPath) {
  try {
    await fs.access(destPath);
    return { status: "skipped-exists" };
  } catch {
    // not present, continue
  }
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return { status: "failed", httpStatus: res.status };
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
  return { status: "ok", bytes: buf.length };
}

async function main() {
  console.log("Fetching sitemap...");
  const sitemapUrls = await fetchSitemapUrls();
  console.log(`Sitemap: ${sitemapUrls.length} URLs`);

  console.log("Scraping pages...");
  const pages = await mapLimit(sitemapUrls, 5, async (url) => {
    try {
      const result = await scrapePage(url);
      console.log(`  ✓ ${result.slug} (${result.language}, ${result.imageCount} images)`);
      return result;
    } catch (e) {
      console.log(`  ✗ ${url}: ${e.message}`);
      return { url, slug: slugFromUrl(url), error: String(e) };
    }
  });

  // Download every unique image referenced by any page.
  const allImages = new Map(); // filename -> {url, refs: [{sourcePage, alt, caption}]}
  for (const page of pages) {
    if (!page.images) continue;
    for (const img of page.images) {
      const filename = imageFilename(img.url);
      if (!allImages.has(filename)) {
        allImages.set(filename, { url: img.url, width: img.width, height: img.height, refs: [] });
      }
      allImages.get(filename).refs.push({
        sourcePage: img.sourcePage,
        alt: img.alt,
        caption: img.caption,
      });
    }
  }

  console.log(`Downloading ${allImages.size} unique images...`);
  const imageEntries = [...allImages.entries()];
  const downloadResults = await mapLimit(imageEntries, 6, async ([filename, info]) => {
    const dest = path.join(RAW, "images", filename);
    const result = await downloadImage(info.url, dest);
    if (result.status === "failed") console.log(`  ✗ ${filename}: HTTP ${result.httpStatus}`);
    return { filename, ...info, ...result };
  });

  // Book: copy slide-NNN-*.png images (from the sunkus-paminklai page) into
  // raw/book/ in reading order, in addition to the general raw/images/ copies.
  const bookPage = pages.find((p) => p.slug === BOOK_SLUG);
  let bookPageCount = 0;
  if (bookPage && bookPage.images) {
    const bookImages = bookPage.images
      .map((img) => ({ ...img, filename: imageFilename(img.url) }))
      .filter((img) => /^slide-\d+-\d+\.\w+$/.test(img.filename));
    const seen = new Map(); // page number -> filename (first occurrence wins)
    for (const img of bookImages) {
      const num = Number(img.filename.match(/^slide-(\d+)-\d+/)[1]);
      if (!seen.has(num)) seen.set(num, img.filename);
    }
    const ordered = [...seen.entries()].sort((a, b) => a[0] - b[0]);
    bookPageCount = ordered.length;
    for (const [num, filename] of ordered) {
      const src = path.join(RAW, "images", filename);
      const dest = path.join(RAW, "book", `${String(num).padStart(3, "0")}.png`);
      try {
        await fs.copyFile(src, dest);
      } catch (e) {
        console.log(`  ✗ book page ${num} (${filename}): ${e.message}`);
      }
    }
    await fs.writeFile(
      path.join(RAW, "meta", "book.json"),
      JSON.stringify({ slug: BOOK_SLUG, pageCount: bookPageCount, pages: ordered.map(([num, filename]) => ({ page: num, filename })) }, null, 2)
    );
  }

  // Site-wide meta: contact email, PayPal link, favicon, og:image, title/tagline.
  const homeHtml = await fetchText(BASE + "/");
  const $home = cheerio.load(homeHtml);
  const meta = {
    siteTitle: $home("title").first().text().replace(/\s*[–-]\s*.*$/, "").trim(),
    contactEmail: (homeHtml.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0] || null,
    paypalLink: (homeHtml.match(/https:\/\/(?:www\.)?paypal\.me\/[^\s"'<>]+/) || [])[0] || null,
    favicon: $home('link[rel="icon"]').attr("href") || null,
    ogImage: $home('meta[property="og:image"]').attr("content") || null,
  };
  await fs.writeFile(path.join(RAW, "meta", "site.json"), JSON.stringify(meta, null, 2));

  // urls.json
  const urlsJson = pages.map((p) => ({
    url: p.url,
    slug: p.slug,
    language: p.language,
    title: p.title,
    imageCount: p.imageCount,
    error: p.error || null,
  }));
  await fs.writeFile(path.join(RAW, "meta", "urls.json"), JSON.stringify(urlsJson, null, 2));

  // images.json
  const imagesJson = downloadResults.map((r) => ({
    filename: r.filename,
    originalUrl: r.url,
    width: r.width,
    height: r.height,
    status: r.status,
    bytes: r.bytes || null,
    refs: r.refs,
  }));
  await fs.writeFile(path.join(RAW, "meta", "images.json"), JSON.stringify(imagesJson, null, 2));

  // Cross-reference against content/qr-locked-urls.md (read, don't hand-copy).
  // Only match table rows (| Page | `/path/` |), not illustrative path mentions
  // in prose (e.g. "no locale prefix (no `/lt/`)" or "a generic `/gallery` path").
  const qrDoc = await fs.readFile(path.join(ROOT, "content", "qr-locked-urls.md"), "utf8");
  const qrPaths = [...qrDoc.matchAll(/^\|.+\|\s*`(\/[a-z0-9-]*\/)`\s*\|\s*$/gm)]
    .map((m) => m[1].replace(/^\/|\/$/g, ""))
    .filter((p, i, arr) => arr.indexOf(p) === i);
  qrPaths.push(""); // homepage row's path column is just `/`, matched separately below
  const scrapedSlugs = new Set(pages.map((p) => p.slug === "index" ? "" : p.slug));
  const crossRef = qrPaths.map((p) => ({ path: p, found: scrapedSlugs.has(p) }));
  const missing = crossRef.filter((c) => !c.found);

  const inventory = `# Scrape inventory

Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/scrape.mjs\`.

## Counts
- Pages scraped: ${pages.length} (${pages.filter((p) => p.error).length} errors)
- Unique images downloaded: ${downloadResults.filter((r) => r.status === "ok").length} / ${downloadResults.length} (${downloadResults.filter((r) => r.status === "skipped-exists").length} already existed, ${downloadResults.filter((r) => r.status === "failed").length} failed)
- Book pages: ${bookPageCount}

## QR-locked-URL cross-reference (content/qr-locked-urls.md)
${crossRef.map((c) => `- ${c.found ? "✅" : "❌"} /${c.path}/`).join("\n")}

${missing.length > 0 ? `**${missing.length} path(s) in qr-locked-urls.md were NOT found live** — see discrepancies below.` : "All QR-locked paths accounted for."}

## Known discrepancies (investigated 2026-07-20, not blockers — see scripts/scrape.mjs LT_SLUGS comment)
1. **/siaudinis-sodas/ 404s live today.** The QR doc names this slug for "Šiaudinis sodas" (Straw Garden), but it does not exist on the current WordPress site and does not redirect anywhere — it is a plain 404. The actual live page for this artwork is **/sodas/** (title "Sodas"), content-matched and confirmed to be the same straw/mirror garden installation. If the physical QR plaque really does say "siaudinis-sodas", **that plaque has been broken on the live site for a while already** — this is not something the migration caused. Both /sodas/ and /siaudinis-sodas/ have been archived; recommend building both on the new site (cheap insurance) and separately telling the human to go check what the physical plaque actually says.
2. **/ikos-grinbergo-portretas/ (bare) 301-redirects to /ikos-grinbergo-portretas-1/ live.** -1 and -2 are two genuinely different artworks (a historical memorial inscription vs. an artistic love-story mural), not duplicates. All three slugs archived; the bare slug should serve -1's content directly (not a redirect) on the new site, matching current live behavior.

## Small images (long edge < 2000px — upscale candidates for the next step)
${imagesJson.filter((i) => i.width && i.width < 2000).map((i) => `- ${i.filename} (${i.width}×${i.height})`).join("\n") || "(none flagged — width/height not always available from HTML attributes; verify against actual downloaded files too)"}

## Pages with scrape errors
${pages.filter((p) => p.error).map((p) => `- ${p.url}: ${p.error}`).join("\n") || "(none)"}
`;

  await fs.writeFile(path.join(RAW, "meta", "INVENTORY.md"), inventory, "utf8");
  console.log("Done. See raw/meta/INVENTORY.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
