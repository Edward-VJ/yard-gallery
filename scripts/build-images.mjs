// Build-time responsive image pipeline (YG-5 step 3). Reads assets/registry.json
// (the ledger from build-assets.mjs), and for every active entry emits AVIF +
// WebP derivatives at a fixed set of widths (capped to the source's actual
// width — never upscale beyond what's already there) into site/public/img/,
// plus a tiny blurred LQIP data URI. Writes site/lib/image-manifest.json,
// consumed by the <ArtImage> component.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "assets");
const SITE = path.join(ROOT, "site");
const OUT_DIR = path.join(SITE, "public", "img");
const MANIFEST_PATH = path.join(SITE, "lib", "image-manifest.json");

const WIDTHS = [640, 1280, 1920, 2560, 3840];
const CLOUDFLARE_FILE_CAP = 20000;
const WARN_THRESHOLD = 15000;

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

function baseName(filename) {
  return filename.replace(/\.[^.]+$/, "");
}

async function buildLqip(srcPath) {
  const buf = await sharp(srcPath)
    .resize(24, 24, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function buildEntry(entry) {
  const srcPath = path.join(
    ASSETS,
    entry.upscaledPath ?? entry.originalPath
  );
  const width = entry.upscaledWidth ?? entry.originalWidth;
  const height = entry.upscaledHeight ?? entry.originalHeight;
  const base = baseName(entry.filename);
  const subdir = entry.category === "book" ? "book" : "";
  const widths = WIDTHS.filter((w) => w <= width);
  if (widths.length === 0 || widths[widths.length - 1] !== width) {
    // Always include one variant at the true source width so nothing is
    // upscaled and small originals still get at least one derivative.
    widths.push(width);
  }

  const variants = { avif: [], webp: [] };
  let fileCount = 0;
  for (const w of widths) {
    const resized = sharp(srcPath).resize({ width: w, withoutEnlargement: true });
    for (const format of ["avif", "webp"]) {
      const outName = `${subdir ? subdir + "-" : ""}${base}-${w}.${format}`;
      const outPath = path.join(OUT_DIR, outName);
      await resized
        .clone()
        [format]({ quality: format === "avif" ? 55 : 70 })
        .toFile(outPath);
      variants[format].push({ width: w, url: `/img/${outName}` });
      fileCount++;
    }
  }

  const lqip = await buildLqip(srcPath);

  return {
    filename: entry.filename,
    manifestKey: entry.category === "book" ? `book/${entry.filename}` : entry.filename,
    entry: {
      width,
      height,
      aspectRatio: width / height,
      lqip,
      variants,
    },
    fileCount,
  };
}

async function main() {
  const registry = JSON.parse(await fs.readFile(path.join(ASSETS, "registry.json"), "utf8"));
  const active = registry.filter((e) => e.status === "active");
  console.log(`Processing ${active.length} active assets (${registry.length - active.length} skipped/failed)...`);

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });

  const manifest = {};
  let totalFiles = 0;
  let done = 0;

  const results = await mapLimit(active, 4, async (entry) => {
    const result = await buildEntry(entry);
    done++;
    if (done % 50 === 0 || done === active.length) {
      console.log(`  [${done}/${active.length}] ${result.manifestKey}`);
    }
    return result;
  });

  for (const r of results) {
    manifest[r.manifestKey] = r.entry;
    totalFiles += r.fileCount;
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\nDone. ${Object.keys(manifest).length} images in manifest, ${totalFiles} derivative files written to site/public/img/.`);
  console.log(`Cloudflare Pages free-tier cap: ${CLOUDFLARE_FILE_CAP} files/deployment. This pipeline's share: ${totalFiles}.`);
  if (totalFiles > WARN_THRESHOLD) {
    console.warn(`\n⚠️  WARNING: ${totalFiles} files exceeds the ${WARN_THRESHOLD} soft-warn threshold — trim widths/formats before this becomes a deploy blocker (site JS/CSS/HTML output adds more on top of this).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
