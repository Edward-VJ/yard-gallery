# yard-gallery

Rebuild of [yard.gallery](https://yard.gallery) (Kiemo Galerija — an open-air street-art gallery in a historic courtyard in Kaunas, Lithuania) as a free, static, multilingual site, replacing the current WordPress install.

## Project tracking

Detailed planning/tickets live in a separate private companion repo, `yard-gallery-plan` — not here. This repo only holds what the build and test suite actually need at runtime:

- [`content/qr-locked-urls.md`](./content/qr-locked-urls.md) — **read before touching any routing.** Physical, laser-cut QR codes in the courtyard encode exact Lithuanian URLs that cannot change. These are already public on the live WordPress site, so there's no reason to keep this file private — the test suite reads it directly.

`references/` holds UI inspiration (not shipped code).

## Status

Planning complete as of 2026-07-20; scaffold not yet executed.
