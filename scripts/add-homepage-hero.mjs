// One-off: adds the homepage hero image (the WordPress "Cover" block image
// at the top of https://yard.gallery/, missed by the original scrape.mjs
// image harvest since Cover-block images weren't in its selector set) into
// the same assets/registry.json + upscale + responsive-derivative pipeline
// as everything else, without re-running the full 666-image batch.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { upscaleOne, computeTargetDims } from "./upscale.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FILENAME = "image_2024-08-31_183725770.png";
const RAW_SRC = path.join(ROOT, "raw", "images", FILENAME);
const ASSETS = path.join(ROOT, "assets");
const SITE = path.join(ROOT, "site");
const OUT_DIR = path.join(SITE, "public", "img");
const MANIFEST_PATH = path.join(SITE, "lib", "image-manifest.json");
const MODEL = "high-fidelity-4x";
const WIDTHS = [640, 1280, 1920, 2560, 3840];

async function main() {
  const origDest = path.join(ASSETS, "originals", FILENAME);
  const upDest = path.join(ASSETS, "upscaled", FILENAME);
  await fs.copyFile(RAW_SRC, origDest);
  const result = await upscaleOne(RAW_SRC, upDest, MODEL, 256);
  console.log(`Upscaled: ${result.width}x${result.height} -> ${result.targetWidth}x${result.targetHeight}`);

  const registry = JSON.parse(await fs.readFile(path.join(ASSETS, "registry.json"), "utf8"));
  registry.push({
    filename: FILENAME,
    category: "artwork",
    originalPath: path.relative(ASSETS, origDest).replace(/\\/g, "/"),
    upscaledPath: path.relative(ASSETS, upDest).replace(/\\/g, "/"),
    originalWidth: result.width,
    originalHeight: result.height,
    upscaledWidth: result.targetWidth,
    upscaledHeight: result.targetHeight,
    model: MODEL,
    refs: [{ sourcePage: "https://yard.gallery/", alt: "", caption: null }],
    duplicateOf: null,
    status: "active",
  });
  await fs.writeFile(path.join(ASSETS, "registry.json"), JSON.stringify(registry, null, 2));
  console.log(`Registry updated (${registry.length} entries).`);

  const base = FILENAME.replace(/\.[^.]+$/, "");
  const width = result.targetWidth;
  const height = result.targetHeight;
  const widths = WIDTHS.filter((w) => w <= width);
  if (widths[widths.length - 1] !== width) widths.push(width);

  const variants = { avif: [], webp: [] };
  for (const w of widths) {
    const resized = sharp(upDest).resize({ width: w, withoutEnlargement: true });
    for (const format of ["avif", "webp"]) {
      const outName = `${base}-${w}.${format}`;
      await resized.clone()[format]({ quality: format === "avif" ? 55 : 70 }).toFile(path.join(OUT_DIR, outName));
      variants[format].push({ width: w, url: `/img/${outName}` });
    }
  }
  const lqip = await sharp(upDest).resize(24, 24, { fit: "inside" }).webp({ quality: 40 }).toBuffer();

  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  manifest[FILENAME] = {
    width,
    height,
    aspectRatio: width / height,
    lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
    variants,
  };
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest updated: ${FILENAME} (${widths.length} widths x 2 formats = ${widths.length * 2} files).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
