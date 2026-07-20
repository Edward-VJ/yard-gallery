# YG-3: AI-upscale images toward 4K (human-supervised)

## Goal
Every gallery image at ≥ ~3840px long edge (or its best achievable quality), produced by a pipeline the human has explicitly approved on sample batches. Fidelity to the original artwork is the hard constraint — these are photos of murals/art; the upscaler must NOT invent detail that changes the art.

## Tool decision (fixed — no further tool evaluation needed)
**Primary and only required tool: Real-ESRGAN via the `realesrgan-ncnn-vulkan` backend, driven through Upscayl (GUI) or its bundled CLI.** Verified mid-2026: both are free (Real-ESRGAN core BSD-3-Clause; the ncnn-vulkan backend MIT; Upscayl app AGPL-3.0 — AGPL only imposes source-disclosure obligations if you redistribute a *modified* version as a network service, which does not apply here — running the desktop app locally to batch-process your own photos creates zero obligations). Both projects are feature-frozen (no new releases since ~2022/Dec 2024) but stable and still the community-standard free local upscaler; nothing newer has replaced them as of mid-2026. Vulkan-based, so it runs on the RTX 3060 Ti regardless of CUDA support, and supports tiling to fit 8GB VRAM.
- Pilot candidate models: `realesrgan-x4plus` (general photo) vs `4x-UltraSharp` (community model, sharper detail) — both ship with/are loadable in Upscayl.
- OpenAI API image models are explicitly OUT of scope for upscaling — they regenerate rather than upscale and would alter the artwork. Not used at any step.
- No ComfyUI/Civit.ai pipeline needed — adds dependency/version surface for no proven benefit over Real-ESRGAN for this use case. Skip it.

## Known gotchas (from research — plan around these, don't rediscover them)
- **VRAM**: use an explicit tile size (`-t 256`, drop to `-t 128` if you hit `vkAllocateMemory failed`/OOM) rather than auto (`-t 0`), which can OOM on 8GB cards when targeting 4K output.
- **Known black-image bug**: some GPU/driver combos with ncnn-vulkan occasionally output solid-black results. Always run and visually check ONE test image before batch-processing the rest.

## Steps
1. From `raw/meta/INVENTORY.md` (YG-2), list upscale candidates: long edge < 3840px. Images already ≥ 4K pass through untouched.
2. Install Upscayl. Build `scripts/upscale.mjs` (or .py) wrapping the bundled `realesrgan-ncnn-vulkan` CLI: takes input dir + model + scale + tile-size, writes to `processed/upscaled/<model>/`, never overwrites `raw/`.
3. Run one single test image through the pipeline first; open it and visually confirm it isn't the known black-image failure mode before proceeding.
4. **Pilot batch**: pick 6 diverse images (dark mural, bright mural, portrait, wide courtyard shot, book page, smallest/worst image). Run through both `realesrgan-x4plus` and `4x-UltraSharp`.
5. **Human review gate**: build a tiny local HTML side-by-side comparator (original vs each model, synced zoom/pan) at `scripts/compare.html`. STOP and have the human pick the winning model and flag any artifacts. Do not proceed without explicit approval. (This is a quality-judgment checkpoint, not an open planning question — the tool and models are already decided above.)
6. Bulk-run the approved model over all candidates, tile-size set explicitly per gotcha above. Log per-image results to `processed/upscale-log.json` (input res → output res, model, tile size, time, pass/fail on visual spot check).
7. Second human spot-check: random 10% sample plus every image the pilot flagged as risky. Redo failures with the other model; if nothing acceptable, ship the original resolution for that image and note it in the log.
8. Store final masters in `processed/masters/` (gitignored; backed up like `raw/`). YG-5 build step will generate web derivatives (AVIF/WebP at 640/1280/1920/2560/3840) from these masters.

## Acceptance criteria
- Human approved the model choice on the pilot AND the 10% spot-check.
- Every gallery image has a master ≥ 3840px long edge or a documented exception.
- Zero images where the upscaler visibly altered the artwork (human-confirmed).
- `raw/` originals untouched.
