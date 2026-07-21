// Builds side-by-side LT/<locale> review docs for the priority locales
// (en, ru, pl — lt is the source itself) so a native speaker can skim
// translations against the original without opening JSON files. Writes
// into the yard-gallery-plan repo, not the public site repo, since these
// are planning/QA artifacts.
import fs from "node:fs/promises";
import path from "node:path";

const SITE_ROOT = "F:/claude_projects/kiemo_galerija";
const PLAN_ROOT = "F:/claude_projects/kiemo_galerija_plan";
const REVIEW_LOCALES = ["en", "ru", "pl"];

async function readJson(p) {
  return JSON.parse(await fs.readFile(p, "utf8"));
}

async function main() {
  const ltArtworks = await readJson(path.join(SITE_ROOT, "content", "artworks.lt.json"));
  const ltMessages = await readJson(path.join(SITE_ROOT, "messages", "lt.json"));

  await fs.mkdir(path.join(PLAN_ROOT, "review"), { recursive: true });

  for (const locale of REVIEW_LOCALES) {
    const artworks = await readJson(path.join(SITE_ROOT, "content", `artworks.${locale}.json`));
    const messages = await readJson(path.join(SITE_ROOT, "messages", `${locale}.json`));
    const artworkByLt = Object.fromEntries(ltArtworks.map((a) => [a.slug, a]));

    let md = `# Translation review — Lithuanian ↔ ${locale}\n\n`;
    md += `Generated from \`content/artworks.${locale}.json\` and \`messages/${locale}.json\` in the yard-gallery repo. Source (LT) next to translation — skim for anything that reads wrong, especially the five historically sensitive entries (marked ⚠️ below).\n\n`;

    md += `## Core pages\n\n`;
    const sections = [
      ["home", "Home"],
      ["history", "History"],
      ["visiting", "Visiting"],
      ["gallery", "Gallery"],
      ["support", "Support"],
    ];
    for (const [key, label] of sections) {
      md += `### ${label}\n\n`;
      md += `**LT:** ${(ltMessages[key].intro || ltMessages[key].body || "").replace(/\n/g, " ⏎ ")}\n\n`;
      md += `**${locale.toUpperCase()}:** ${(messages[key].intro || messages[key].body || "").replace(/\n/g, " ⏎ ")}\n\n---\n\n`;
    }

    md += `## Artworks (${artworks.length})\n\n`;
    const SENSITIVE = new Set([
      "vaiku-akcija",
      "ikos-grinbergo-portretas-1",
      "ikos-grinbergo-portretas-2",
      "ditos-ir-judo-zupaviciu-portretas",
      "kaimynes-brones-portretas",
    ]);
    for (const artwork of artworks) {
      const lt = artworkByLt[artwork.slug];
      const flag = SENSITIVE.has(artwork.slug) ? " ⚠️" : "";
      md += `### ${artwork.title}${flag} (\`${artwork.slug}\`)\n\n`;
      md += `**LT title:** ${lt.title}\n\n`;
      md += `**LT:**\n> ${lt.description.replace(/\n/g, "\n> ")}\n\n`;
      md += `**${locale.toUpperCase()}:**\n> ${artwork.description.replace(/\n/g, "\n> ")}\n\n---\n\n`;
    }

    const outPath = path.join(PLAN_ROOT, "review", `${locale}.md`);
    await fs.writeFile(outPath, md);
    console.log(`Wrote ${outPath} (${md.length} chars)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
