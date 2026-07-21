// Builds assets/originals/ and assets/upscaled/ — two folders, matching
// filenames, meant to be browsed side by side by a human later (sort by
// resolution, spot bad upscales, identify near-duplicate images uploaded
// under different filenames — see BACKLOG note in the plan repo for that
// follow-up work, deliberately not automated here).
//
// Decisions (2026-07-21, from the human after reviewing the pilot):
// - Model: high-fidelity-4x (clearly beat ultrasharp-4x across the pilot).
// - Resolution: 4x capped at ~4K (3840) on the long edge, not blind 4x —
//   see upscale.mjs computeTargetDims.
// - Book pages (Sunkūs Paminklai): kept at ORIGINAL resolution, no upscale
//   at all — both upscaled candidates made the scanned text harder to read.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { upscaleOne, computeTargetDims } from "./upscale.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "raw");
const ASSETS = path.join(ROOT, "assets");
const MODEL = "high-fidelity-4x";
const TILE_SIZE = 256;

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

async function main() {
  const images = JSON.parse(await fs.readFile(path.join(RAW, "meta", "images.json"), "utf8"));
  const book = JSON.parse(await fs.readFile(path.join(RAW, "meta", "book.json"), "utf8"));
  const bookFilenames = new Set(book.pages.map((p) => p.filename));

  const artworkImages = images.filter(
    (img) => img.status !== "failed" && !bookFilenames.has(img.filename)
  );

  await fs.mkdir(path.join(ASSETS, "originals"), { recursive: true });
  await fs.mkdir(path.join(ASSETS, "upscaled"), { recursive: true });
  await fs.mkdir(path.join(ASSETS, "originals", "book"), { recursive: true });
  await fs.mkdir(path.join(ASSETS, "upscaled", "book"), { recursive: true });

  console.log(`Artwork images to upscale: ${artworkImages.length}`);
  console.log(`Book pages (no upscale, direct copy): ${book.pages.length}`);

  const registry = [];

  // Book pages: copy unchanged into both originals and upscaled.
  // book.json's "filename" is the ORIGINAL WordPress filename (e.g.
  // slide-001-1.png) — the actual saved file in raw/book/ is renamed to
  // NNN.png by reading order (see scrape.mjs), which is what we read from.
  for (const { page } of book.pages) {
    const destName = `${String(page).padStart(3, "0")}.png`;
    const src = path.join(RAW, "book", destName);
    const origDest = path.join(ASSETS, "originals", "book", destName);
    const upDest = path.join(ASSETS, "upscaled", "book", destName);
    await fs.copyFile(src, origDest);
    await fs.copyFile(src, upDest);
    const dims = await computeTargetDims(src).catch(() => null);
    registry.push({
      filename: destName,
      category: "book",
      page,
      originalPath: path.relative(ASSETS, origDest).replace(/\\/g, "/"),
      upscaledPath: path.relative(ASSETS, upDest).replace(/\\/g, "/"),
      originalWidth: dims?.width ?? null,
      originalHeight: dims?.height ?? null,
      upscaledWidth: dims?.width ?? null, // unchanged — same as original
      upscaledHeight: dims?.height ?? null,
      model: null, // not upscaled
      refs: [],
      duplicateOf: null,
      status: "active",
    });
  }
  console.log(`✓ book pages copied (unchanged, original resolution kept)`);

  // Artwork images: copy original + run the capped-4x upscale.
  let done = 0;
  // Concurrency 1: single GPU doing tiled Vulkan compute — untested whether
  // concurrent upscayl-bin processes contend for VRAM safely, not worth the
  // risk of OOM crashes mid-batch. Each image is fast enough serially anyway.
  const results = await mapLimit(artworkImages, 1, async (img) => {
    const src = path.join(RAW, "images", img.filename);
    const origDest = path.join(ASSETS, "originals", img.filename);
    const upDest = path.join(ASSETS, "upscaled", img.filename);
    try {
      await fs.copyFile(src, origDest);
      const result = await upscaleOne(src, upDest, MODEL, TILE_SIZE);
      done++;
      console.log(`✓ [${done}/${artworkImages.length}] ${img.filename}: ${result.width}x${result.height} -> ${result.targetWidth}x${result.targetHeight}`);
      return {
        filename: img.filename,
        category: "artwork",
        originalPath: path.relative(ASSETS, origDest).replace(/\\/g, "/"),
        upscaledPath: path.relative(ASSETS, upDest).replace(/\\/g, "/"),
        originalWidth: result.width,
        originalHeight: result.height,
        upscaledWidth: result.targetWidth,
        upscaledHeight: result.targetHeight,
        model: MODEL,
        refs: img.refs,
        duplicateOf: null,
        status: "active",
      };
    } catch (e) {
      done++;
      console.error(`✗ [${done}/${artworkImages.length}] ${img.filename}: ${e.message}`);
      return {
        filename: img.filename,
        category: "artwork",
        originalPath: path.relative(ASSETS, origDest).replace(/\\/g, "/"),
        upscaledPath: null,
        originalWidth: null,
        originalHeight: null,
        upscaledWidth: null,
        upscaledHeight: null,
        model: MODEL,
        refs: img.refs,
        duplicateOf: null,
        status: "upscale-failed",
      };
    }
  });

  registry.push(...results);
  await fs.writeFile(path.join(ASSETS, "registry.json"), JSON.stringify(registry, null, 2));

  const failed = results.filter((r) => r.status === "upscale-failed");
  console.log(`\nDone. ${registry.length} assets registered (${failed.length} upscale failures).`);
  if (failed.length) console.log("Failed:", failed.map((f) => f.filename).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
