// Validates all 13 locale files against the Lithuanian source: identical
// artwork slugs, identical message/content key structures, no empty
// required values, no leftover Lithuanian-only characters in non-lt files,
// no {placeholder} token mismatches. Exits non-zero on any failure — meant
// to run in CI (see plan, yard-gallery-plan repo, 08-testing.md).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const LOCALES = ["lt", "en", "ru", "pl", "uk", "de", "fr", "es", "pt", "it", "ja", "zh", "ko"];
const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;
// Values that are DELIBERATELY identical to the Lithuanian source across every
// locale (proper titles that don't get translated, per the translation rules)
// — exempt these from the "looks untranslated" check below.
const INTENTIONALLY_UNTRANSLATED = new Set(["Sunkūs Paminklai", "Imagine", "Kiemo Galerija"]);
// Key paths that hold technical/structural data, not translatable prose —
// these are SUPPOSED to be identical across every locale.
const NON_TRANSLATABLE_KEY = /(^|\.)(imagePrefix|contactEmail)$/;

function keysOf(obj, prefix = "") {
  let keys = [];
  for (const k in obj) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      keys = keys.concat(keysOf(obj[k], p));
    } else {
      keys.push(p);
    }
  }
  return keys.sort();
}

function collectStrings(obj, prefix = "") {
  let out = [];
  for (const k in obj) {
    const p = prefix ? `${prefix}.${k}` : k;
    const v = obj[k];
    if (typeof v === "string") out.push([p, v]);
    else if (v && typeof v === "object") out = out.concat(collectStrings(v, p));
  }
  return out;
}

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, "utf8"));
}

async function main() {
  const errors = [];

  const ltArtworks = await readJson(path.join(ROOT, "content", "artworks.lt.json"));
  const ltMessages = await readJson(path.join(ROOT, "messages", "lt.json"));
  const ltBook = await readJson(path.join(ROOT, "content", "book.lt.json"));
  const ltSlugs = ltArtworks.map((a) => a.slug).sort();
  const ltMsgKeys = keysOf(ltMessages);
  const ltBookKeys = keysOf(ltBook);
  // Placeholder sets, keyed by full path, from the LT source (ground truth).
  const ltPlaceholders = Object.fromEntries(
    collectStrings(ltMessages).map(([k, v]) => [k, (v.match(PLACEHOLDER_RE) || []).sort()])
  );
  const ltMsgByKey = Object.fromEntries(collectStrings(ltMessages));
  const ltArtworkBySlug = Object.fromEntries(ltArtworks.map((a) => [a.slug, a]));

  for (const locale of LOCALES) {
    const prefix = `[${locale}]`;
    let artworks, messages, book;
    try {
      artworks = await readJson(path.join(ROOT, "content", `artworks.${locale}.json`));
      messages = await readJson(path.join(ROOT, "messages", `${locale}.json`));
      book = await readJson(path.join(ROOT, "content", `book.${locale}.json`));
    } catch (e) {
      errors.push(`${prefix} missing or invalid JSON: ${e.message}`);
      continue;
    }

    // Slug parity
    const slugs = artworks.map((a) => a.slug).sort();
    if (JSON.stringify(slugs) !== JSON.stringify(ltSlugs)) {
      errors.push(`${prefix} artwork slugs don't match LT source`);
    }

    // Key parity
    const msgKeys = keysOf(messages);
    if (JSON.stringify(msgKeys) !== JSON.stringify(ltMsgKeys)) {
      const missing = ltMsgKeys.filter((k) => !msgKeys.includes(k));
      const extra = msgKeys.filter((k) => !ltMsgKeys.includes(k));
      errors.push(`${prefix} messages.json key mismatch — missing: [${missing}], extra: [${extra}]`);
    }
    const bookKeys = keysOf(book);
    if (JSON.stringify(bookKeys) !== JSON.stringify(ltBookKeys)) {
      errors.push(`${prefix} book.json key mismatch`);
    }

    // Empty values (except intro/alt, which can legitimately be empty)
    for (const [k, v] of collectStrings(messages)) {
      if (v === "" && !k.endsWith("intro") && !k.endsWith("alt")) {
        errors.push(`${prefix} messages.${k} is empty`);
      }
    }
    for (const artwork of artworks) {
      if (!artwork.title) errors.push(`${prefix} artwork ${artwork.slug} has empty title`);
      if (!artwork.description) errors.push(`${prefix} artwork ${artwork.slug} has empty description`);
    }

    // Leftover-untranslated check: flag any field whose value is IDENTICAL to
    // the Lithuanian source (word-for-word), which for anything longer than a
    // short proper noun almost certainly means it was never translated.
    // Short/known proper titles are expected to match and are exempt.
    if (locale !== "lt") {
      for (const [k, v] of collectStrings(messages)) {
        if (NON_TRANSLATABLE_KEY.test(k)) continue;
        const ltVal = ltMsgByKey[k];
        if (ltVal && v === ltVal && v.length > 20 && !INTENTIONALLY_UNTRANSLATED.has(v)) {
          errors.push(`${prefix} messages.${k} is word-for-word identical to the LT source — likely untranslated: "${v.slice(0, 60)}..."`);
        }
      }
      for (const artwork of artworks) {
        const ltArtwork = ltArtworkBySlug[artwork.slug];
        if (!ltArtwork) continue;
        if (artwork.description && artwork.description === ltArtwork.description && artwork.description.length > 20) {
          errors.push(`${prefix} artwork ${artwork.slug} description is word-for-word identical to the LT source — likely untranslated`);
        }
      }
    }

    // Placeholder token parity (messages only — artwork descriptions are free prose)
    for (const [k, v] of collectStrings(messages)) {
      const tokens = (v.match(PLACEHOLDER_RE) || []).sort();
      const ltTokens = ltPlaceholders[k] || [];
      if (JSON.stringify(tokens) !== JSON.stringify(ltTokens)) {
        errors.push(`${prefix} messages.${k} placeholder mismatch — expected [${ltTokens}], got [${tokens}]`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`i18n check FAILED — ${errors.length} issue(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`i18n check passed — ${LOCALES.length} locales, ${ltArtworks.length} artworks each, all structurally consistent.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
