// Upscales images via Upscayl's bundled realesrgan-ncnn-vulkan CLI.
// Never overwrites raw/ — always writes to processed/.
//
// Usage: node upscale.mjs <model> <outDir> <tileSize> <inputFile> [inputFile...]
//   model:    filename (no extension) of a .bin/.param pair in Upscayl's models dir,
//             e.g. high-fidelity-4x, ultrasharp-4x
//   outDir:   destination directory (created if missing)
//   tileSize: 0 = auto, or an explicit tile size (e.g. 256) to avoid VRAM OOM
//             on 8GB cards — see plan (yard-gallery-plan repo) 03-upscale.md gotchas
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const execFileAsync = promisify(execFile);

const UPSCAYL_BIN = "C:\\Program Files\\Upscayl\\resources\\bin\\upscayl-bin.exe";
const MODELS_DIR = "C:\\Program Files\\Upscayl\\resources\\models";

async function upscaleOne(inputPath, outDir, model, tileSize) {
  const outputPath = path.join(outDir, path.basename(inputPath));
  const args = [
    "-i", inputPath,
    "-o", outputPath,
    "-n", model,
    "-m", MODELS_DIR,
    "-t", String(tileSize),
  ];
  const start = Date.now();
  await execFileAsync(UPSCAYL_BIN, args, { maxBuffer: 10 * 1024 * 1024 });
  return { input: inputPath, output: outputPath, ms: Date.now() - start };
}

async function main() {
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
      const result = await upscaleOne(input, outDir, model, tileSize);
      console.log(`✓ ${path.basename(input)} (${(result.ms / 1000).toFixed(1)}s)`);
      log.push({ ...result, status: "ok" });
    } catch (e) {
      console.error(`✗ ${path.basename(input)}: ${e.message}`);
      log.push({ input, status: "failed", error: e.message });
    }
  }
  await fs.writeFile(
    path.join(outDir, "_upscale-log.json"),
    JSON.stringify({ model, tileSize, results: log }, null, 2)
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
