// Extracts Lithuanian source content from raw/pages/*.txt into structured
// content/artworks.lt.json, content/book.lt.json, and the page-copy portion
// of messages/lt.json. Text is copied verbatim — no rewriting. See plan
// (yard-gallery-plan repo) 04-translations.md.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "raw");
const CONTENT = path.join(ROOT, "content");

// Canonical artwork/room slugs (deduplicated — see aliasSlugs for the two
// cases where the QR-locked list names a second slug for the same content:
// siaudinis-sodas -> sodas (404 live, corrected slug used instead), and
// bare ikos-grinbergo-portretas -> ikos-grinbergo-portretas-1 (live 301).
const ARTWORK_SLUGS = [
  { slug: "nijoles-katinas" },
  { slug: "kaimynes-ponios-kazimieros-portretas" },
  { slug: "kaimynu-sauliaus-ir-ritmos-portretai" },
  { slug: "imagine" },
  { slug: "saugi-kaimynyste" },
  { slug: "juodasis-namas" },
  { slug: "sapnu-siuvykla" },
  { slug: "menininko-zano-hoffmano-portretas" },
  { slug: "petriuko-portretas" },
  { slug: "elizos-ozeskienes-portretas" },
  { slug: "melynasis-namas" },
  { slug: "sodas", aliasSlugs: ["siaudinis-sodas"] },
  { slug: "paslapciu-kambariai" },
  { slug: "baltasis-namas" },
  { slug: "jokubo-grinbergo-namai" },
  { slug: "vaiku-akcija" },
  { slug: "ikos-grinbergo-portretas-1", aliasSlugs: ["ikos-grinbergo-portretas"] },
  { slug: "ikos-grinbergo-portretas-2" },
  { slug: "ditos-ir-judo-zupaviciu-portretas" },
  { slug: "mimo-portretas" },
  { slug: "levo-tolstojaus-portretas" },
  { slug: "tomo-ir-jono-portretas" },
  { slug: "kaimynes-nijoles-teta" },
  { slug: "kaimynes-brones-portretas" },
  { slug: "gyvybes-medis" },
  { slug: "senoji-informacine-lenta" },
  { slug: "pirmasis-kambarys" },
  { slug: "antrasis-kambarys" },
  { slug: "treciasis-kambarys" },
  { slug: "ketvirtasis-kambarys" },
  { slug: "penktasis-kambarys" },
  { slug: "sestasis-kambarys" },
];

async function readText(slug) {
  try {
    return (await fs.readFile(path.join(RAW, "pages", `${slug}.txt`), "utf8")).trim();
  } catch {
    return "";
  }
}

// The homepage has no .entry-content — it's a custom front-page template
// with the FULL Lithuanian and English versions concatenated on the same
// page, back to back (this is exactly the "hardcoded duplicate translation"
// problem from the original request). Split at the English h2 to get just
// the Lithuanian half.
async function extractHomepageLt() {
  const html = await fs.readFile(path.join(RAW, "pages", "index.html"), "utf8");
  const $ = cheerio.load(html);
  const main = $("main").first();
  const title = main.find("h2").first().text().replace(/\s+/g, " ").trim();
  const paragraphs = [];
  for (const el of main.find("p").toArray()) {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text || /^Virtuali Galerija \|/.test(text)) break; // nav link row = end of LT section
    paragraphs.push(text);
  }
  return { title, intro: paragraphs.join("\n\n") };
}

async function main() {
  const urls = JSON.parse(await fs.readFile(path.join(RAW, "meta", "urls.json"), "utf8"));
  const images = JSON.parse(await fs.readFile(path.join(RAW, "meta", "images.json"), "utf8"));
  const byUrlSlug = Object.fromEntries(urls.map((u) => [u.slug, u]));

  function imagesForPage(slug) {
    const pageUrl = byUrlSlug[slug]?.url;
    if (!pageUrl) return [];
    return images
      .filter((img) => img.refs?.some((r) => r.sourcePage === pageUrl))
      .map((img) => {
        const ref = img.refs.find((r) => r.sourcePage === pageUrl);
        return { filename: img.filename, alt: ref?.alt || "", caption: ref?.caption || null };
      });
  }

  // content/artworks.lt.json
  const artworks = [];
  for (const { slug, aliasSlugs } of ARTWORK_SLUGS) {
    const meta = byUrlSlug[slug];
    if (!meta) {
      console.warn(`⚠ no scraped page found for artwork slug "${slug}"`);
      continue;
    }
    artworks.push({
      slug,
      aliasSlugs: aliasSlugs || [],
      title: meta.title,
      description: await readText(slug),
      images: imagesForPage(slug),
    });
  }
  await fs.mkdir(CONTENT, { recursive: true });
  await fs.writeFile(path.join(CONTENT, "artworks.lt.json"), JSON.stringify(artworks, null, 2));
  console.log(`✓ content/artworks.lt.json — ${artworks.length} artworks`);

  // content/book.lt.json
  const bookMeta = byUrlSlug["sunkus-paminklai"];
  const bookText = await readText("sunkus-paminklai");
  await fs.writeFile(
    path.join(CONTENT, "book.lt.json"),
    JSON.stringify({ slug: "sunkus-paminklai", title: bookMeta?.title || "Sunkūs Paminklai", intro: bookText }, null, 2)
  );
  console.log(`✓ content/book.lt.json`);

  // History page's two embedded slideshow galleries (discovered 2026-07-21 —
  // NOT the Sunkus Paminklai book; separate embedded presentations on the
  // Istorija page. Flagged to the human; defaulting to inline-gallery
  // treatment within History rather than a dedicated viewer route, pending
  // confirmation).
  const historyGalleries = [
    {
      title: "Knyga 1 – Pradžia",
      imagePrefix: "2f2a7638ee3ad0f7de567f76ba679b67-",
      imageCount: 74,
    },
    {
      title: "Knyga 2 – Kiemo scenografija ir „Paslapčių kambariai“",
      imagePrefix: "kiemo-scenografijos-ir-paslapciu-kambariai-2024-07-13-interneto-svetainei-ii-dalis-",
      imageCount: 94,
    },
  ];

  // messages/lt.json — core UI + page copy
  const homepage = await extractHomepageLt();
  const messagesLt = {
    nav: {
      home: "Pagrindinis",
      history: "Istorija",
      gallery: "Virtuali galerija",
      visiting: "Lankymo laikas ir taisyklės",
      book: "Sunkūs Paminklai",
      support: "Paaukoti",
    },
    home: {
      // The live homepage's <title> tag literally reads "Kiemo Galerija –
      // Imagine" (an artifact of the live site, confirmed directly via
      // curl) — not a scrape bug, just not sensible to carry over.
      title: "Kiemo Galerija",
      intro: homepage.intro,
    },
    history: {
      title: "Istorija",
      intro: await readText("istorija"),
      galleries: historyGalleries,
    },
    visiting: {
      title: byUrlSlug["lankymo-laikas-ir-taisykles"]?.title || "Lankymo laikas ir taisyklės",
      body: await readText("lankymo-laikas-ir-taisykles"),
    },
    gallery: {
      title: byUrlSlug["kiemo-galerija-virtuali-galerija"]?.title || "Virtuali galerija",
      intro: (await readText("kiemo-galerija-virtuali-galerija")).split("\n\n")[0],
    },
    support: {
      // No dedicated donate page exists on the old site — it's a persistent
      // header button ("Paaukoti | Donate") linking straight to PayPal. This
      // page is new; kept short and factual, not verbatim-extracted since
      // there's no equivalent page to extract from. Flagged to the human.
      title: "Paremkite Kiemo Galeriją",
      body: "Kiemo galerija yra bendruomenės iniciatyva, kurią palaiko savanoriai ir aukotojai. Jūsų parama padeda prižiūrėti meno kūrinius ir kiemo erdvę.",
    },
    footer: {
      contactEmail: "kiemogalerija@gmail.com",
      donate: "Paaukoti",
    },
  };
  await fs.mkdir(path.join(ROOT, "messages"), { recursive: true });
  await fs.writeFile(path.join(ROOT, "messages", "lt.json"), JSON.stringify(messagesLt, null, 2));
  console.log(`✓ messages/lt.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
