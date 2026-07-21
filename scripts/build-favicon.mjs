// Regenerates the site favicon from the original yard.gallery clock icon
// (raw/site/favicon-source.png, fetched from the live WordPress site's own
// uploads — see raw/meta/site.json's "favicon" field for the source URL).
// Sharp can't write .ico directly, so favicon.ico is hand-assembled as a
// minimal single-image "PNG ICO" container (supported by all modern
// browsers/OSes since Vista — no extra dependency needed for one image).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "raw", "site", "favicon-source.png");
const APP_DIR = path.join(ROOT, "site", "app");

function buildIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256px)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // color count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // image data size
  entry.writeUInt32LE(header.length + entry.length, 12); // offset

  return Buffer.concat([header, entry, pngBuffer]);
}

async function main() {
  const source = sharp(SOURCE);

  const icon32 = await source.clone().resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await fs.writeFile(path.join(APP_DIR, "favicon.ico"), buildIco(icon32, 32));
  console.log("✓ site/app/favicon.ico (32x32)");

  await source
    .clone()
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(APP_DIR, "icon.png"));
  console.log("✓ site/app/icon.png (512x512)");

  await source
    .clone()
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(APP_DIR, "apple-icon.png"));
  console.log("✓ site/app/apple-icon.png (180x180, white bg — iOS doesn't composite transparency)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
