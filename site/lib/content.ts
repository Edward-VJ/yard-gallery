import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/i18n/locales";

// Content lives in the repo-root /content directory (see repo CLAUDE.md),
// not duplicated under site/ — read straight from there at build time.
const CONTENT_ROOT = path.join(process.cwd(), "..", "content");

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_ROOT, relPath), "utf8")) as T;
}

export type ArtworkImage = {
  filename: string;
  alt: string;
  caption: string | null;
};

export type Artwork = {
  slug: string;
  aliasSlugs: string[];
  title: string;
  description: string;
  images: ArtworkImage[];
};

export type Book = {
  slug: string;
  title: string;
  intro: string;
};

export function getArtworks(locale: Locale): Artwork[] {
  return readJson<Artwork[]>(`artworks.${locale}.json`);
}

export function getArtwork(locale: Locale, slug: string): Artwork | undefined {
  return getArtworks(locale).find(
    (a) => a.slug === slug || a.aliasSlugs.includes(slug)
  );
}

export function getBook(locale: Locale): Book {
  return readJson<Book>(`book.${locale}.json`);
}

// Non-translatable site facts scraped once from the old WordPress footer —
// same value in every locale, so not part of messages/*.json.
export const SITE_CONFIG = {
  contactEmail: "kiemogalerija@gmail.com",
  paypalUrl: "https://paypal.me/yardgallery?country.x=LT&locale.x=en_US",
};
