# yard-gallery

Rebuild of [yard.gallery](https://yard.gallery) (Kiemo Galerija — an open-air street-art gallery in a historic courtyard in Kaunas, Lithuania) as a free, static, multilingual site, replacing the current WordPress install.

## Project tracking

There's no external issue tracker for this project — the plan lives entirely in this repo as individual step-by-step files under [`plan/`](./plan). Each file is a self-contained ticket meant to be executed in order:

- [`plan/00-overview.md`](./plan/00-overview.md) — start here: goals, stack, locales, the hard QR-code URL constraint
- [`plan/qr-locked-urls.md`](./plan/qr-locked-urls.md) — **read before touching any routing** — physical QR codes in the courtyard encode exact URLs that cannot change
- `plan/01-repo-scaffold.md` through `plan/09-deploy-domain.md` — one ticket per build phase

`references/` holds UI inspiration (not shipped code).

## Status

Planning complete as of 2026-07-20; scaffold (`plan/01-repo-scaffold.md`) not yet executed.
