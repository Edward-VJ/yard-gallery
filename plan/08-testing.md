# YG-8: Formal testing — Playwright e2e, i18n, Lighthouse, accessibility

## Goal
The formal test suite the old site never had — deliberately exhaustive, not a token smoke test. Runs in CI on every push; deploy (YG-9) is blocked on green. Target: **150+ discrete assertions** across the suite (tracked via Playwright's test count in CI output — if the suite is thinner than that, it isn't done). Since this is a public GitHub repo, CI minutes are free/unlimited, so thoroughness costs nothing but wall-clock; use `--shard` across parallel jobs if the suite exceeds ~10 minutes.

## Pinned tooling (verified current 2026-07-20)
- **Playwright 1.61.x** (Apache-2.0, free). Install browsers in CI via `npx playwright install --with-deps` on `ubuntu-latest` pinned to **Node 24** (`actions/setup-node@v4`, `node-version: 24` — do not rely on the runner default).
- **`@axe-core/playwright`** for automated accessibility scans (free, MIT).
- **`@lhci/cli`** (0.15.x) for Lighthouse budgets — stable/maintained-enough, still the standard free option, no replacement has emerged.
- Test against the actual static output: `npm run build` then serve `out/` with a plain static server (e.g. `npx serve out` or `http-server`) — never test against `next dev`, since dev-mode behavior can diverge from the static export that actually ships.
- Browser matrix: **chromium + firefox + webkit** for the critical-path specs (nav, language switcher, gallery scroll-preservation, book viewer — the behaviors this project explicitly can't regress on); **chromium-only** for broad per-locale/per-page coverage to keep CI time reasonable.
- Viewports: mobile (393×852, Pixel-class), tablet (768×1024), desktop (1440×900), ultrawide (1920×1080). Not every spec needs every viewport — see breakdown below for which.

## Test suite breakdown (enumerate as separate spec files under `site/e2e/`)

### 0. `qr-locked-urls.spec.ts` — THE most important spec in the suite, run it first
Physical, un-reprintable, laser-cut QR codes in the real world encode the exact paths in `plan/qr-locked-urls.md`. A regression here means a QR code that can never be fixed without re-cutting and re-installing a physical plaque — treat any failure in this spec as a release blocker above every other test, including visual ones.
- For every single path in `plan/qr-locked-urls.md` (both Tier 1 and Tier 2, plus the book's slug once discovered in YG-2): fresh navigation (not client-side) to that exact path returns 200 and renders the expected Lithuanian content — for artwork pages, the gallery scroll with that artwork's quickview modal pre-opened; for hub/info pages, the expected page.
- Explicitly assert NONE of these paths have a `/lt/` prefix — bare root only.
- Explicitly assert `/lt` and `/lt/` do NOT exist as valid pages anywhere on the site (the split-tree architecture from YG-1 should make this structurally impossible, but assert it directly rather than trusting the architecture).
- Cross-check: parse `plan/qr-locked-urls.md` itself in the test (don't hand-copy the list into the spec — read the source file) so the test can never silently drift out of sync with the canonical list.

### 1. `nav.spec.ts` — routing & navigation (chromium, all 13 locales)
- For each of the 13 locales: homepage returns 200, `<html lang>` matches the locale, every header/footer nav link resolves 200.
- Every page has `hreflang` alternate tags for all 13 locales + `x-default`, and each alternate href actually resolves 200.
- 404 page renders localized (test at least lt, en, ja, ru).
- Canonical `<link rel="canonical">` present and correct on every page type.
- Confirm the split-tree architecture: lt pages are bare (no prefix), all 12 other locales are prefixed (`/en/...`, `/ru/...`, etc.).

### 2. `language-switcher.spec.ts` (chromium + firefox + webkit)
- From Home, Visiting, Gallery, and Book landing: switch through all 13 locales one at a time; assert URL locale segment changes, the equivalent page is retained (not bounced to Home), `<html lang>` updates.
- Switching persists via `localStorage` across a reload.
- First visit with no stored preference honors `Accept-Language` header emulation (test at least one non-default match, e.g. `de-DE` → lands on `/de`), falls back to `lt` when no match exists.

### 3. `gallery-scroll.spec.ts` — the hard requirement (chromium + firefox + webkit)
- Scroll to 10%, 50%, and 90% depth; open an artwork via click; press browser Back; assert scroll position is pixel-identical to before opening AND the modal is closed. Repeat all three depths.
- Same three depths, close via Esc instead of Back — same scroll-preservation assertion.
- Same via the ✕ button and via click-outside.
- Open via keyboard (Tab to a thumbnail, press Enter/Space) — modal opens, focus lands inside it.
- Arrow-key navigation between artworks while modal is open, including boundary behavior at the first and last artwork (assert it does not wrap unless explicitly designed to, or wraps consistently — whichever YG-6 implements, pin the behavior in this test).
- Rapid open→close→open→close (10 cycles) — no scroll drift accumulates, no leaked event listeners cause double-firing.
- Deep link `/[locale]/gallery/[slug]` loaded directly (fresh navigation, not client-side) — modal is open on load with the correct artwork; pressing Back from here goes to the plain `/[locale]/gallery` scroll (not further back in history than that).
- Focus trap: while modal is open, Tab cycles only within the modal; closing returns focus to the thumbnail that opened it.
- Touch emulation (mobile viewport): swipe gestures navigate between artworks in the modal.
- Every gallery image has non-empty alt text (scan all artworks, not a sample).
- `prefers-reduced-motion: reduce` emulated — scroll-reveal animation is disabled/instant.

### 4. `book-viewer.spec.ts` — zero document scroll (chromium + firefox + webkit, desktop + mobile viewports)
- Enter reading mode from the landing page; assert Fullscreen API was requested (or the `100dvh` fallback overlay is active if fullscreen is unavailable in the test environment).
- Navigate forward through all pages via →, assert `window.scrollY` (and the viewer container's `scrollTop`) is exactly 0 after every single keypress — not just at the end.
- Same navigating backward via ←.
- Click-to-navigate on left/right screen halves — same zero-scroll assertion.
- Swipe navigation on mobile viewport — same assertion.
- Boundary behavior: pressing → on the last page and ← on the first page (define and assert the exact behavior — no-op vs. exit).
- Resize/orientation change mid-read (viewport size change while on page N) — page stays correctly `object-fit: contain`-centered, still zero scroll.
- Exit via ✕ and via Esc — both return to the landing state at the same reading position.
- Reload mid-book — `sessionStorage` position is honored, resumes on the same page.
- Hash deep link `/[locale]/book#12` loads directly onto page 12 without any scroll jump.
- Auto-hiding controls: fade in on mouse move/tap, auto-hide after ~2s of inactivity (assert both states).
- Confirm no scrollbar ever appears in the viewer at any of the 4 viewport sizes.

### 5. `accessibility.spec.ts` (chromium)
- `@axe-core/playwright` automated scan on Home, Visiting, Support, Gallery, Book landing, and one open gallery modal + one open book page — in lt and en (2 locales is enough for an automated scan; it's testing markup, not translation). Zero critical/serious violations.
- Full keyboard-only pass: Tab through an entire page top-to-bottom, assert visible focus indicator at every stop, assert no keyboard trap exists anywhere outside the intentional gallery/book modal traps.
- Color contrast spot-check on body text and primary CTA buttons in both light and dark mode.

### 6. `visual-regression.spec.ts` (chromium only, lt + en)
- `toHaveScreenshot()` baselines for Home, Gallery (top of scroll), Book landing at all 4 viewports, in lt and en (8 pages × 2 locales = 16 baselines — enough to catch layout regressions without an unmaintainable baseline set). Commit baselines only after explicit human visual sign-off per YG-5/06/07.

### 7. `seo-meta.spec.ts` (chromium, sampled across locales)
- Every page has a non-empty, locale-appropriate `<title>` and meta description (spot-check all 13 locales on Home; full 13-locale check would be redundant with the i18n completeness script in #9).
- Open Graph image tag present and resolves 200.
- `sitemap.xml` is valid XML and every URL in it resolves 200; `robots.txt` is valid and references the sitemap.

### 8. `link-and-asset-integrity.spec.ts` (static crawl over `out/`, not a browser test)
- Crawl every generated HTML file; assert every internal `<a href>` resolves to an existing file in `out/`.
- Assert every `<img>`/`<source>` reference (including `srcset` entries) resolves to an existing file.
- Assert every artwork in `content/artworks.*.json` has all its expected derivative widths present per the YG-5 image manifest.

### 9. `i18n-completeness.spec.ts`
- Script check (also runnable standalone, from YG-4): every locale's message/content file has exactly the same key set as `lt.json`; no empty string values; no leftover Lithuanian-only characters (ėęįšųūž) in non-lt files; no `{placeholder}` token mismatches between locales.
- Playwright-level check: render each page in each of the 13 locales and assert no raw i18n key strings (e.g. literal `"history.title"`) leak into the rendered DOM text — the standard smell test for a missing translation falling through to its key.

### 10. `redirects.spec.ts` (from YG-9's `_redirects`, tested against the deployed Cloudflare preview or a local redirect-rule parser)
- Every URL captured in `raw/meta/urls.json` (YG-2) has a corresponding rule and 301s to a page that actually exists in the new site.
- Explicitly test rules at position >100 in the `_redirects` file to catch the known Cloudflare quirk where rules silently drop past #100 in some setups.

### Lighthouse CI budgets (`@lhci/cli`, separate CI job)
- Home, Gallery, Book landing — lt and en. Budgets: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95. Store reports as CI artifacts on every run, not just failures.

## CI wiring
- `.github/workflows/ci.yml`: lint → build → (parallel jobs) unit/static checks, Playwright e2e (sharded if needed), Lighthouse CI. Deploy (YG-9) only triggers after all jobs are green.
- Document `npm run test:e2e`, `npm run test:i18n`, `npm run lighthouse` in the README.

## Acceptance criteria
- Full suite green in CI from a clean clone, node pinned to 24.
- Suite contains 150+ discrete assertions (rough proxy for "obscene, not token" coverage) — check Playwright's own summary count.
- `qr-locked-urls.spec.ts` passes for every path in `plan/qr-locked-urls.md` with zero exceptions — this is the single highest-priority acceptance criterion in the entire project, above visual polish.
- The scroll-preservation (gallery), zero-document-scroll (book), and QR-locked-URL tests exist and are verified to actually fail when the behavior is deliberately broken once, then confirmed to pass again after reverting — proving the tests have teeth, not just green-by-default.
- No silent scope-narrowing: if any of the above specs is deferred or trimmed for time, it must be logged explicitly in the ticket, not just dropped.
