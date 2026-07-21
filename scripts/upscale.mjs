// Upscales images via Upscayl's bundled realesrgan-ncnn-vulkan CLI.
// Never overwrites raw/ — always writes to assets/upscaled/ (or wherever
// the caller points outDir).
//
// The model is trained at a fixed 4x factor, but we don't want a blind 4x —
// a tiny source blown up 4x is still tiny, and an already-large source
// blown up 4x is wastefully huge. Instead: 4x capped at ~4K on the long
// edge, computed per-image from its real dimensions (via sharp), passed to
// the CLI's -r WxH flag (which resizes to an EXACT dimension — it does not
// preserve aspect ratio itself, so we compute a same-ratio WxH ourselves).
//
// CLI usage: node upscale.mjs <model> <outDir> <tileSize> <inputFile> [inputFile...]
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

export const UPSCAYL_BIN = "C:\\Program Files\\Upscayl\\resources\\bin\\upscayl-bin.exe";
export const MODELS_DIR = "C:\\Program Files\\Upscayl\\resources\\models";
export const MAX_LONG_EDGE = 3840; // matches the derivative ceiling in plan 05-site-shell-pages.md

export async function computeTargetDims(inputPath) {
  const { width, height } = await sharp(inputPath).metadata();
  const longEdge = Math.max(width, height);
  const scale = Math.min(4, MAX_LONG_EDGE / longEdge);
  return {
    width,
    height,
    targetWidth: Math.max(1, Math.round(width * scale)),
    targetHeight: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

export async function upscaleOne(inputPath, outputPath, model, tileSize) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const dims = await computeTargetDims(inputPath);
  const args = [
    "-i", inputPath,
    "-o", outputPath,
    "-n", model,
    "-m", MODELS_DIR,
    "-t", String(tileSize),
    "-r", `${dims.targetWidth}x${dims.targetHeight}`,
  ];
  const start = Date.now();
  await execFileAsync(UPSCAYL_BIN, args, { maxBuffer: 10 * 1024 * 1024 });
  return { input: inputPath, output: outputPath, ms: Date.now() - start, ...dims };
}

async function cliMain() {
  const [model, outDir, tileSizeArg, ...inputs] = process.argv.slice(2);
  if (!model || !outDir || !tileSizeArg || inputs.length === 0) {
    console.error("Usage: node upscale.mjs <model> <outDir> <tileSize> <inputFile> [inputFile...]");
    process.exit(1);
  }
  const tileSize = Number(tileSizeArg);
  await fs.mkdir(outDir, { recursive: true });

  const log = [];
  for (const input of inputs) {
    try {
      const outputPath = path.join(outDir, path.basename(input));
      const result = await upscaleOne(input, outputPath, model, tileSize);
      console.log(`✓ ${path.basename(input)}: ${result.width}x${result.height} -> ${result.targetWidth}x${result.targetHeight} (${(result.ms / 1000).toFixed(1)}s)`);
      log.push({ ...result, status: "ok" });
    } catch (e) {
      console.error(`✗ ${path.basename(input)}: ${e.message}`);
      log.push({ input, status: "failed", error: e.message });
    }
  }
  await fs.writeFile(
    path.join(outDir, "_upscale-log.json"),
    JSON.stringify({ model, tileSize, maxLongEdge: MAX_LONG_EDGE, results: log }, null, 2)
  );
}

// Only run the CLI entrypoint when this file is executed directly, not when imported.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  cliMain().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
