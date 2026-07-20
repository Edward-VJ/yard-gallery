# YG-5: Site shell + core pages (Home/History, Visiting, Donate)

## Goal
The full site chrome and all non-gallery pages, in the art-nouveau-inspired visual language of `references/art_noveau.jsx`, fully localized.

## Design direction
- Take from `art_noveau.jsx`: the serif/sans pairing (Newsreader + Epilogue style), generous whitespace, thin-rule frames, small-caps label typography, muted palette with gold/ivory accents, roman-numeral section markers.
- Adapt: this is a memorial street-art gallery, not a perfume shop — imagery is the murals; palette should defer to the photos (near-neutral surfaces, one accent).
- Dark + light mode via `prefers-color-scheme`, class-toggle override.

## Tailwind v4 config note (fixed decision)
`references/art_noveau.jsx` embeds a legacy `tailwind.config = { theme: { extend: { colors, borderRadius, spacing, fontFamily, fontSize } } }` JS object (it was a CDN-Tailwind prototype). This project uses Tailwind v4's CSS-first config — port those exact token values directly into a `@theme { --color-...: ...; --font-...: ...; }` block in `site/app/globals.css`. Do not add a `tailwind.config.js` and do not use the `@config` legacy-opt-in directive — translate the values once, directly, into `@theme`.

## HARD CONSTRAINT — read `plan/qr-locked-urls.md` first: Home and History are SEPARATE pages, not one
The QR-locked list has the homepage at bare `/` AND Istorija (History) as its own distinct page at bare `/istorija/` — they are two different physical QR codes pointing to two different pages, not one combined page as originally sketched below. Fix accordingly: Home is a short landing page (hero + CTAs), History is its own full page. Similarly Visiting must land at bare `/lankymo-laikas-ir-taisykles/` for Lithuanian (not a generic `/visiting`), per YG-1's split-tree routing. "Senoji Informacinė Lenta" (Old Information Board) is also Tier 1 QR-locked (`/senoji-informacine-lenta/`) but sits in the QR document's list alongside the individual artworks, not the core pages — confirm during YG-2 scraping whether its WordPress structure matches an artwork page (photo + short text) or a core content page, and build it as whichever it actually is; if it's artwork-shaped, it belongs in YG-6's gallery slug list instead of here.

## Steps
1. Build the shell: header (site name, nav, language switcher per YG-4 spec), footer (contact email kiemogalerija@gmail.com, PayPal donate link, social links if any were scraped). Sticky, unobtrusive.
2. Port the `art_noveau.jsx` theme tokens into `@theme` in `globals.css` per the note above (adapted palette, not copied verbatim — see Design direction).
3. Image pipeline: build-time script `scripts/build-images.mjs` using `sharp` (0.35.x, requires the Node 24 pin from YG-1) — reads `processed/masters/`, emits AVIF/WebP at 640/1280/1920/2560/3840 widths into `site/public/img/`, plus a tiny blurhash/LQIP placeholder, writing a manifest `site/lib/image-manifest.json` used by an `<ArtImage>` component (`<picture>` + `srcset` + lazy loading + aspect-ratio boxes, no CLS). Log a running total file count against the Cloudflare Pages free-tier 20,000-file-per-deployment cap (YG-9) — flag loudly if projected output count exceeds ~15,000 so widths/formats can be trimmed before it becomes a deploy blocker.
4. Pages, split across the two route trees from YG-1 (`app/(lt)/...` bare paths for Lithuanian matching `plan/qr-locked-urls.md` exactly, `app/[locale]/...` prefixed for the other 12 locales, unconstrained shape):
   - **Home** (lt: `/`; other locales: `/xx/`): short landing — hero mural image, brief intro, CTA links to History, Virtual Gallery, and Visiting. NOT combined with History.
   - **History / Istorija** (lt: `/istorija/`; other locales: `/xx/history` or similar): the gallery's full story (Vytenis Jakas, the courtyard, the memorial to former Jewish residents), a few key photos interleaved art-nouveau style. Its own distinct page — see HARD CONSTRAINT above.
   - **Visiting / Lankymo laikas ir taisyklės** (lt: `/lankymo-laikas-ir-taisykles/`; other locales: `/xx/visiting` or similar): hours, rules, location/how to find it, map link (plain OpenStreetMap/Google link — no embedded tracker iframes).
   - **Support / Donate** (not QR-locked — no entry in `plan/qr-locked-urls.md` — URL shape is free, e.g. `/xx/support` for every locale including lt): the PayPal donation link from the old site, short text on what donations fund.
   - **404** localized.
5. SEO/meta: per-page localized `<title>`/description, `hreflang` alternates for all 13 locales + `x-default`, Open Graph image, `sitemap.xml` and `robots.txt` generated at build.
6. Accessibility pass: semantic landmarks, alt text from the scraped captions, keyboard-navigable menus/switcher, visible focus states, contrast ≥ WCAG AA.
7. Responsive: verify 360px, 768px, 1440px, ultrawide. No horizontal scroll anywhere.

## Acceptance criteria
- All core pages render in all 13 locales with real content from YG-4.
- Images served as AVIF/WebP with srcset; Lighthouse: Performance ≥ 90, A11y ≥ 95, SEO ≥ 95 on Home.
- Visual sign-off from the human on the shell + Home before closing.
