# YG-7: Sunkūs Paminklai — fullscreen book viewer

## Goal
The Sunkūs Paminklai book presented as a true fullscreen reader: page fills the viewport, navigation is effortless, no UI chrome in the way, and — hard requirement — **no page scrolling** that can knock the view around (the current WordPress version scrolls and misaligns constantly).

## HARD CONSTRAINT — read `plan/qr-locked-urls.md` first
The book's exact WordPress slug was NOT in the source QR document (the page was added after it was written) — YG-2 discovers it during scraping and it must be treated as QR-critical by default. Whatever that slug is, the Lithuanian version of this page must live at that exact bare path (via the `(lt)` route group from YG-1), not at a generically-chosen `/book` path.

## Steps
1. Route: for Lithuanian, `app/(lt)/<exact-discovered-slug>/page.tsx` (bare path, per the constraint above); for the other 12 locales, `app/[locale]/book/page.tsx` is a fine unconstrained default. Both use `raw/book/` masters (upscaled in YG-3) and `content/book.<locale>.json`.
2. Landing state: title, short intro (localized), a "Read" button, and a cover thumbnail. Reading state: enters the viewer.
3. Viewer:
   - Requests the browser Fullscreen API on "Read" (with graceful fallback to a fixed, `100dvh` overlay when fullscreen is denied, e.g. iOS Safari).
   - Page image rendered `object-fit: contain`, centered — never cropped, never scrollable. `overflow: hidden` on the viewer root; `touch-action` managed so swipes never rubber-band the document. Document scroll is fully locked while reading.
   - Navigation: ←/→ keys, click/tap left-right screen halves, swipe on touch. Optional pinch-zoom on the current page (zoom is clamped and pans inside the page only, releases back to fit).
   - Chrome: nothing visible by default. Brief fade-in of controls (page x/y counter, ✕ close, locale-aware) on mouse move/tap, auto-hide after ~2s.
   - Exit: ✕ or Esc leaves fullscreen and returns to the landing state at the same reading position (position remembered in sessionStorage).
4. Preload current ±2 pages; pages beyond that load lazily. Show a subtle placeholder while a page decodes.
5. Deep-linkable page number via hash (`/book#12`) without triggering scroll.
6. Test on mobile portrait + landscape and desktop; verify no scrollbar can ever appear in the viewer and orientation change re-fits the page.

## Acceptance criteria
- Book is readable start-to-finish with keyboard only, and with swipes only on mobile.
- Zero document scrolling in the viewer; page always fully visible and centered.
- Human sign-off after reading a few pages on both desktop and phone.
