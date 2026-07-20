# YG-6: Virtual gallery — long scroll + lightbox/quickview

## Goal
The centerpiece page: a long-scrolling gallery of large images (inspiration: https://v0.app/templates/vessel-studio-ZIHJBIvfeuW), where clicking an artwork opens a **lightbox/modal quickview** — visually like Vessel's detail page, but WITHOUT navigating away, so closing it returns you to exactly where you were in the scroll.

## Why lightbox instead of detail pages
On the old site (and the Vessel template) clicking opens a new page; the browser back button then drops you at the top of the gallery and you lose your place. Hard requirement: scroll position is always preserved.

## HARD CONSTRAINT — read `plan/qr-locked-urls.md` first, routing is NOT `/gallery/[slug]`
Physical QR codes next to each real mural encode bare top-level Lithuanian paths — `/nijoles-katinas/`, `/baltasis-namas/`, etc., NOT `/gallery/nijoles-katinas/`. The hub/scroll page itself lives at `/kiemo-galerija-virtuali-galerija/` (lt), not at a generic `/gallery` path. Slugs are fixed to the exact WordPress values in `plan/qr-locked-urls.md` — never regenerate a slug from a title.

## Steps
1. Routes (within the split-tree architecture from YG-1): the hub/scroll page is `app/(lt)/kiemo-galerija-virtuali-galerija/page.tsx` for Lithuanian (bare path, matching the QR-locked list) and `app/[locale]/gallery/page.tsx` for the other 12 locales (their URL shape is unconstrained, `/gallery` is a fine, readable default). Each individual artwork is its own static page at the bare slug: `app/(lt)/nijoles-katinas/page.tsx`, `app/(lt)/baltasis-namas/page.tsx`, … (one per entry in `plan/qr-locked-urls.md`) for Lithuanian, and `app/[locale]/gallery/[slug]/page.tsx` for the other locales (their slugs can reuse the same WordPress slug values for consistency — there's no requirement they must, but there's no reason not to either). Every artwork page — in either tree — renders the SAME long-scroll gallery experience with that artwork's quickview modal pre-opened; it is not a separate/different page template. `[slug]`/per-artwork pages need their own `generateStaticParams` (one static page per artwork, per the fixed slug list), and every page calls `setRequestLocale(locale)`. Data: `content/artworks.<locale>.json` + image manifest from YG-5, keyed by the fixed WordPress slugs.
2. Scroll layout: full-bleed or near-full-bleed large images stacked vertically (single column on mobile, generous max-width on desktop), each with title + short caption in the art-nouveau label style; subtle scroll-reveal (respect `prefers-reduced-motion`). Lazy-load below the fold; images at high srcset sizes — this page is where the 4K masters shine.
3. Quickview modal:
   - Opens on click/Enter; renders artwork large (near-fullscreen), caption/description, any additional images of that artwork as a swipeable strip below — matching the Vessel detail look inside the modal.
   - Implementation: plain client modal; update the URL via `history.pushState` WITHOUT scroll reset, so each artwork keeps a shareable deep link. For Lithuanian, the pushed URL is the bare top-level slug (`/nijoles-katinas/`, matching the QR code exactly) — NOT `/gallery/nijoles-katinas/`. For other locales, push `/xx/gallery/<slug>`. Direct visits to either the bare lt path or the prefixed non-lt path (both static-exported pages per YG-1's split tree) render the gallery scroll + auto-open the correct modal — this is exactly what happens when someone scans a physical QR code and lands cold on `/nijoles-katinas/`.
   - Browser Back closes the modal (popstate handler) and the scroll position is untouched. Esc and an ✕ button also close. ←/→ move between artworks while open.
   - Body scroll locked behind the modal; focus trapped; focus returns to the clicked thumbnail on close; `aria-modal`, labelled by artwork title.
4. Preload the next/previous artwork's image when the modal is open.
5. Test explicitly (also add to YG-8 e2e): scroll 60% down → open artwork → press browser Back → assert scroll position unchanged and modal closed. Same with Esc. Deep link at the bare lt slug (e.g. `/nijoles-katinas/`) loads fresh with the modal open — this IS the QR-code cold-start path, test it as such, not as an afterthought.

## Acceptance criteria
- Scroll position preserved in every close path (Back, Esc, ✕, click-outside).
- Every exact path in `plan/qr-locked-urls.md` for an artwork loads that artwork's modal correctly when visited cold (fresh navigation, simulating a QR scan).
- Deep links work statically; keyboard + screen-reader accessible; reduced-motion respected.
- Human sign-off on look/feel vs the Vessel reference.
