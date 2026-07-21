// Generates one literal page.tsx per artwork slug (+ aliases) under
// site/app/(lt)/ — can't be a single [artworkSlug] dynamic segment because
// it collides with [locale] at the app root (see components/LtArtworkPage.tsx
// for the full explanation). Re-run this whenever artwork slugs change.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content", "artworks.lt.json");
const APP_LT = path.join(ROOT, "site", "app", "(lt)");

const PAGE_TEMPLATE = (slug) => `import type { Metadata } from "next";
import { ltArtworkMetadata, LtArtworkPage } from "@/components/LtArtworkPage";

const SLUG = "${slug}";

export async function generateMetadata(): Promise<Metadata> {
  return ltArtworkMetadata(SLUG);
}

export default async function Page() {
  return <LtArtworkPage slug={SLUG} />;
}
`;

const artworks = JSON.parse(fs.readFileSync(CONTENT, "utf8"));
const slugs = artworks.flatMap((a) => [a.slug, ...a.aliasSlugs]);

for (const slug of slugs) {
  const dir = path.join(APP_LT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "page.tsx"), PAGE_TEMPLATE(slug));
}

console.log(`Generated ${slugs.length} artwork pages under site/app/(lt)/`);
