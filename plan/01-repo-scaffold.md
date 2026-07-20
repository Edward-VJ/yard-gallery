# YG-1: Set up GitHub repo + Next.js static scaffold + CI

## Goal
A public GitHub repo `yard-gallery` containing a Next.js static-export skeleton that builds cleanly in CI.

## Pinned versions (verified current 2026-07-20 — do not re-check or substitute)
Next.js 16.2.x · React (whatever create-next-app 16.2.x pairs it with) · Tailwind CSS 4.3.x (CSS-first `@theme` config) · next-intl 4.13.x · sharp 0.35.x (added in YG-5) · Playwright 1.61.x (added in YG-8) · Node.js 24 LTS (Active LTS, chosen over Node 22's Maintenance LTS for longer runway).

## HARD CONSTRAINT — read `plan/qr-locked-urls.md` first
Physical, laser-cut, un-reprintable QR codes already encode exact Lithuanian URLs (homepage at bare `/`, artworks at bare top-level slugs like `/nijoles-katinas/`). This changes the routing architecture from a uniform `/[locale]/...` scheme to a split tree — see step 6 below. Get this right before building anything on top of it; a mistake here is expensive to unwind later.

## Steps
1. In `F:\claude_projects\kiemo_galerija`, run `git init`, create `.gitignore` (`node_modules/`, `.next/`, `out/`, `.env*`, `raw/`, `processed/` — scraped originals and upscale masters never go in git).
2. Create `.nvmrc` at repo root containing `24`. Confirm local Node is 24.x (`node -v`); if not, install Node 24 LTS first.
3. Scaffold Next.js into `site/`: `npx create-next-app@latest site --ts --tailwind --app --no-src-dir` (pulls current Next 16.2.x + Tailwind 4.3.x automatically). Keep `plan/` and `references/` at repo root, outside `site/`.
4. Confirm the scaffold used Tailwind's CSS-first setup (`@import "tailwindcss";` in `app/globals.css`, no `tailwind.config.js` generated). If a `tailwind.config.js` was generated, delete it — theme customization happens via `@theme` in CSS (done in YG-5), not a JS config file.
5. In `site/next.config.mjs` set `output: 'export'` and `images: { unoptimized: true }` (no image-optimization server exists under static export; derivatives are pre-generated in YG-5 via sharp). Do NOT enable `cacheComponents`.
6. **Split routing tree (fixed architecture, not optional):**
   - `app/(lt)/...` — a route group (no URL segment) that serves Lithuanian at bare root paths: `app/(lt)/page.tsx` → `/`, and later `app/(lt)/nijoles-katinas/page.tsx` → `/nijoles-katinas/`, etc., matching `plan/qr-locked-urls.md` exactly. Every page here hardcodes `locale = 'lt'` when calling `setRequestLocale('lt')` and rendering shared content components.
   - `app/[locale]/...` — serves the other 12 locales prefixed (`/en/...`, `/ru/...`, …). `generateStaticParams()` returns only the 12 non-lt locales (en, ru, pl, uk, de, fr, es, pt, it, ja, zh, ko) — lt is deliberately excluded here since it's served by the `(lt)` tree instead. Each page calls `setRequestLocale(locale)`.
   - Both trees import the same shared page-rendering components (e.g. a `<HomePage locale="lt" />` used by both `app/(lt)/page.tsx` and `app/[locale]/page.tsx`) so there's no real content duplication, just thin routing wrappers.
   - No middleware/proxy file anywhere in this project (unsupported under static export either way). A small client component handles best-match locale redirect ONLY for visitors who land with no locale context and aren't hitting a bare lt path directly (e.g. a generic `/gallery`-style entry point doesn't exist here — every real path is either an exact lt path or an explicit `/xx/...` prefixed path).
7. Install `next-intl` (v4.13.x, whatever `npm install next-intl` resolves to at pin time). Config: `localeDetection: false`, no `pathnames`.  Wire minimal `messages/lt.json` and `messages/en.json` with one key to prove the pipeline end-to-end.
8. Placeholder homepage content: "Kiemo Galerija — rebuild in progress."
9. **Mandatory smoke test before continuing to any other ticket**: `npm run build`, serve `out/` locally, and confirm: `/` and `/index.html` serve the Lithuanian placeholder with NO locale prefix; `/en/` serves the English placeholder; there is no `/lt/` path at all (lt lives only at bare paths). This proves the split-tree architecture actually works under static export before any content-heavy ticket (YG-2 onward) builds on top of it. If it doesn't work as expected, stop and resolve it here — do not proceed with a workaround further down the pipeline.
10. Create the GitHub repo with `gh repo create yard-gallery --public --source . --push` (confirm the account first with `gh auth status`).
11. Add GitHub Actions workflow `.github/workflows/ci.yml`: `actions/setup-node@v4` with `node-version: 24` (do not rely on the runner default), then `npm ci`, `npm run lint`, `npm run build` in `site/`. CI must pass before any ticket is closed. (Public repo → GitHub Actions minutes are free/unlimited on standard runners — no budget concern for a thorough CI suite.)
12. Write repo `README.md`: what the project is, dev commands, pinned versions, deploy target (Cloudflare Pages, static export, framework preset "Next.js (Static HTML Export)"), and a pointer to `plan/qr-locked-urls.md` as required reading before touching routing.
13. Write `CLAUDE.md` at repo root: stack decisions and pinned versions above, locale list, the split-routing-tree rule, "content lives in /content and /messages", "never commit API keys, /raw, or /processed".

## Acceptance criteria
- `node -v` reports 24.x locally; CI pins Node 24 explicitly.
- `npm run build` exits 0 locally and in CI; `out/` contains the `(lt)` unprefixed tree and the `[locale]` prefixed tree for the other 12 locales.
- The mandatory smoke test (step 9) passes: bare `/` is Lithuanian, no `/lt/` path exists anywhere.
- No `tailwind.config.js` and no `middleware.ts`/`proxy.ts` exist in the repo.
- Repo pushed to GitHub with README, CLAUDE.md, CI badge green.
