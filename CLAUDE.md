# yard-gallery

Rebuild of yard.gallery (Kiemo Galerija) from WordPress to a free static site. Planning/tickets live in the separate private `yard-gallery-plan` repo — this file covers only what's needed to work in *this* repo correctly.

## Hard constraint — read first

`content/qr-locked-urls.md` lists exact Lithuanian URLs already encoded into physical, laser-cut, un-reprintable QR codes in the real courtyard. Every one of those paths must resolve on this site at the identical path, unprefixed (no `/lt/`). This is the single highest-priority correctness requirement in the project — above visual polish, above everything except "the site is up at all." Read that file before touching any routing decision.

## Architecture (fixed, don't re-litigate)

- **Split routing tree**: `site/app/(lt)/...` (route group, no URL segment) serves Lithuanian at bare root paths matching `content/qr-locked-urls.md` exactly. `site/app/[locale]/...` serves the other 12 locales prefixed (`/en/...`, `/ru/...`, etc. — their shape is unconstrained). Both trees render shared content components; only the routing wrapper differs.
- **Two root layouts, no top-level `app/layout.tsx`**: Next.js requires exactly one `<html>` per render and each locale needs its own `<html lang>`, so `(lt)/layout.tsx` and `[locale]/layout.tsx` are each independent root layouts (the "multiple root layouts" pattern). The home route `/` lives inside `(lt)`, not at a top-level `app/page.tsx`.
- **`trailingSlash: true`** in `next.config.ts` is required, not cosmetic — the QR codes encode trailing-slash paths (`/nijoles-katinas/`), and without this flag `next build` emits flat `slug.html` files instead of `slug/index.html`, which won't match.
- No `middleware.ts`/`proxy.ts` anywhere — unsupported under `output: 'export'`, and not needed since locale routing is handled by the split tree, not next-intl's own prefix/redirect machinery.
- i18n: `next-intl`, wired via `next-intl/plugin` in `next.config.ts` and `i18n/request.ts`. Every page calls `setRequestLocale(locale)` (hardcoded `'lt'` in the `(lt)` tree, `params.locale` in `[locale]`) before rendering translated content, per next-intl's static-rendering-without-middleware pattern.
- Locales: `lt` (source, unprefixed), `en`, `ru`, `pl`, `uk`, `de`, `fr`, `es`, `pt`, `it`, `ja`, `zh`, `ko` (all prefixed). Defined once in `site/i18n/locales.ts` — import from there, don't hardcode the list elsewhere.

## Pinned versions (verified current 2026-07-20)

Next.js 16.2.x · React 19.2.x · Tailwind CSS 4.3.x (CSS-first `@theme`, no `tailwind.config.js`) · next-intl 4.13.x · Node.js 24 LTS. Don't downgrade or substitute without re-verifying compatibility.

## Rules

- Content lives in `/content` and `/messages`, not hardcoded in components.
- Never commit API keys, `/raw` (scraped originals), or `/processed` (upscale masters) — all gitignored.
- This repo is public deliberately (unlimited free GitHub Actions minutes for the e2e suite). Don't put anything here that shouldn't be public — that's what `yard-gallery-plan` (private) is for.
