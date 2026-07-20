# yard.gallery rebuild — plan overview

Full rebuild of https://yard.gallery (Kiemo Galerija — open-air street-art gallery, Kaunas, Lithuania),
replacing the WordPress site with a free, static, multilingual site.

## HARD CONSTRAINT — read `plan/qr-locked-urls.md` before touching routing
Physical laser-cut QR codes are already installed next to the real murals in the courtyard, encoding exact Lithuanian WordPress URLs (e.g. `/nijoles-katinas/`, homepage at bare `/`). These paths CANNOT change — there's no reprinting a laser-cut plaque. This overrides the originally-planned "every locale gets `/[locale]/...`" routing: Lithuanian must be served unprefixed at the site root; ~25 individual artworks are real top-level pages (not entries on one gallery page); a 6-page "Paslapčių kambariai" mini-narrative exists; the book's exact slug is still unknown and must be discovered during scraping. Full details and the complete verbatim URL list are in `plan/qr-locked-urls.md` — every ticket below that touches routing (YG-1, YG-2, YG-6, YG-8, YG-9) has been updated accordingly.

## Goals
- High-res images (originals from WP media library, AI-upscaled toward 4K where needed)
- Modern art-nouveau-inspired UI (see `references/art_noveau.jsx`)
- Long-scroll virtual gallery with lightbox/quickview (inspired by https://v0.app/templates/vessel-studio-ZIHJBIvfeuW) — back button must never lose scroll position
- Fullscreen distraction-free viewer for the Sunkūs Paminklai book
- Proper i18n: one language switcher, ~13 languages, Lithuanian as source of truth
- Free hosting (Cloudflare Pages), domain `yard.gallery` migrated off WordPress
- Actually maintainable: content in JSON/Markdown, tested with Playwright

## Stack (decided — versions verified current as of 2026-07-20, pin these, no re-litigating)
- **Next.js 16.2.x** (App Router, `output: 'export'` — pure static). Requires Node ≥20.9, TypeScript ≥5.1. Do NOT enable the `cacheComponents` flag (changes `generateStaticParams` rules, not needed here). No `middleware.ts`/`proxy.ts` at all — unsupported under static export; locale detection happens client-side per next-intl's static-export pattern.
- **next-intl v4.13.x** — modified static-export config to satisfy the QR-locked-URL constraint (see above): Lithuanian is NOT served under a `/lt/` prefix. Architecture: `app/(lt)/...` route group (no URL segment) serves Lithuanian at bare root paths exactly matching `plan/qr-locked-urls.md`; `app/[locale]/...` (locale ∈ the other 12 locales only, lt excluded) serves everyone else prefixed (`/en/...`, `/ru/...`, etc. — no constraint on their shape). Both trees render the same shared content/components with `locale` fixed to `'lt'` vs. parameterized. `localeDetection: false`, no `pathnames`. A tiny client component at non-lt entry only handles best-match redirect logic for the prefixed tree. Call `setRequestLocale(locale)` in every page for static rendering.
- **Tailwind CSS v4.3.x** — CSS-first config (`@theme` block in `globals.css` + `@import "tailwindcss";`), NOT the legacy `tailwind.config.js` JS object. The `references/art_noveau.jsx` theme (colors/fontFamily/fontSize) gets ported directly into a `@theme` block during YG-5 — do not add a `tailwind.config.js`.
- **sharp 0.35.x** for build-time image processing — requires Node ≥20.9 (satisfied by the Node 24 pin below).
- **Node.js 24 LTS everywhere** (dev machine, CI): pinned via `.nvmrc` = `24`, `package.json` `"engines": {"node": ">=24"}`, and `actions/setup-node@v4` with `node-version: 24` in every CI job. Chosen over Node 22 deliberately: Node 22 is already in Maintenance LTS (support ends ~April 2027) while Node 24 is the current Active LTS (support into 2028) — Node 20 hitting EOL mid-2026 is exactly the kind of surprise this avoids for the length of this project. Never rely on the CI runner's default Node version.
- **Playwright 1.61.x** for e2e (Apache-2.0, free) — see YG-8.
- Hosting: **Cloudflare Pages free tier**, framework preset "Next.js (Static HTML Export)", build command `npx next build`, output dir `out`. Deploy is a plain static deploy — do **not** use `@cloudflare/next-on-pages` (archived/deprecated Sept 2025) or the OpenNext/Workers adapter; neither is needed since there's no SSR.
- Images: originals and AI-upscaled masters kept out of git (`raw/`, `processed/` gitignored, backed up separately); optimized derivatives (AVIF/WebP, multiple sizes) generated at build time by `scripts/build-images.mjs` via sharp.
- Domain: DNS moved to Cloudflare (free) via nameserver change; registration stays at the current registrar (no transfer — see YG-9, this is a fixed decision, not an open question).

## Locales
lt (source), en, ru, pl, uk, de, fr, es, pt, it, ja, zh, ko — 13 total, no RTL languages in scope (Arabic/Hebrew explicitly excluded), so no bidi handling is needed anywhere in the build.

## Ticket order
1. GitHub repo + Next.js static scaffold + CI
2. Scrape everything from yard.gallery (text LT+EN, original full-size images, book pages)
3. AI upscaling pipeline (human-supervised QA)
4. Translation system + all locale files
5. Site shell + core pages (Home/History, Visiting hours & rules, Donate)
6. Virtual gallery with lightbox/quickview
7. Sunkūs Paminklai fullscreen book viewer
8. Testing: Playwright e2e, i18n completeness, Lighthouse
9. Deploy to Cloudflare Pages + domain migration + WP decommission

## Resources
- OpenAI API key: `F:\claude_projects\agent_project\Agent\.env.local` (`OPENAI_API_KEY`) — never commit. NOT used for upscaling (see YG-3) — kept in reserve only in case a future ticket needs a text/LLM API.
- Local GPU: RTX 3060 Ti 8 GB — sufficient for Real-ESRGAN (`realesrgan-ncnn-vulkan`, Vulkan-based) with explicit tile-size flags; see YG-3 for gotchas.
- Reference UI: `references/art_noveau.jsx`

## Human-in-the-loop checkpoints (the ONLY points where execution pauses for input)
These are quality/taste gates, not open planning questions — the plan itself has no unresolved decisions. Everything else runs autonomously ticket-to-ticket.
1. YG-3: pick the winning upscale model after the pilot batch, and again on the 10% spot-check.
2. YG-5/06/07: visual/UX sign-off on the shell, gallery, and book viewer as they're built — iterative, expected.
3. YG-9: the human must personally do registrar/DNS-account actions (log into WordPress.com, add nameservers at Cloudflare, decommission WordPress) since Claude has no access to those accounts.
No other step should require asking the user anything.
