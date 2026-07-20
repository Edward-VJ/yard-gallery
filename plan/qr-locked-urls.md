# QR-locked URLs — HARD CONSTRAINT, read this before touching routing

Source: `C:\Users\ejaku\Downloads\Lietuviski puslapai v3.docx` ("Lietuviski puslapai v3" = "Lithuanian pages v3"), provided 2026-07-20. This is verbatim ground truth, not something to re-derive or guess at.

**Every path below MUST resolve on the new site at the exact same path, in Lithuanian, with no locale prefix (no `/lt/`).** Laser-cut physical QR codes next to the real murals in the courtyard encode these exact URLs. A wrong path here means a QR code that can never be fixed without re-cutting and re-installing physical plaques — this is the highest-priority correctness constraint in the entire project, above visual polish, above everything except "the site is up at all."

Per the user (2026-07-20): the full list of QR targets lives in that docx; the Sunkūs Paminklai book page was added to the site *after* that document was written, so its exact slug is NOT in this list — it must be discovered during scraping (YG-2) and treated with the same exact-preservation caution, since it may also have a physical QR code by now.

## Tier 1 — confirmed physical QR code exists (zero tolerance for URL drift)
| Page (Lithuanian) | Exact path |
|---|---|
| Pagrindinis Puslapis (Homepage) | `/` |
| Nijolės katinas | `/nijoles-katinas/` |
| Kaimynės ponios Kazimieros portretas | `/kaimynes-ponios-kazimieros-portretas/` |
| Kaimynų Sauliaus ir Ritmos portretai | `/kaimynu-sauliaus-ir-ritmos-portretai/` |
| Imagine | `/imagine/` |
| Saugi kaimynystė | `/saugi-kaimynyste/` |
| Juodasis namas | `/juodasis-namas/` |
| Sapnų siuvykla | `/sapnu-siuvykla/` |
| Menininko Zano Hoffmano Portretas | `/menininko-zano-hoffmano-portretas/` |
| Petriuko portretas | `/petriuko-portretas/` |
| Elizos Ožeškienės Portretas | `/elizos-ozeskienes-portretas/` |
| Melynasis Namas | `/melynasis-namas/` |
| Šiaudinis sodas | `/siaudinis-sodas/` |
| Paslapčių kambariai (hub page for the 6 "room" sub-pages below) | `/paslapciu-kambariai/` |
| Baltasis Namas | `/baltasis-namas/` |
| Jokūbo Grinbergo Namai | `/jokubo-grinbergo-namai/` |
| Vaikų akcija | `/vaiku-akcija/` |
| Ikos Grinbergo portretas | `/ikos-grinbergo-portretas/` |
| Ditos ir Judo Zupavičių portretas | `/ditos-ir-judo-zupaviciu-portretas/` |
| Mimo portretas | `/mimo-portretas/` |
| Levo Tolstojaus portretas | `/levo-tolstojaus-portretas/` |
| Tomo ir Jono portretas | `/tomo-ir-jono-portretas/` |
| Kaimynės Nijolės teta | `/kaimynes-nijoles-teta/` |
| Kaimynės Bronės portretas | `/kaimynes-brones-portretas/` |
| Gyvybės medis | `/gyvybes-medis/` |
| Senoji Informacinė Lenta | `/senoji-informacine-lenta/` |
| Lankymo laikas ir taisyklės | `/lankymo-laikas-ir-taisykles/` |
| Istorija | `/istorija/` |
| Kiemo galerija: Virtuali galerija (the gallery hub/index page) | `/kiemo-galerija-virtuali-galerija/` |

(The last two — Istorija, Virtuali galerija — were listed unlabeled at the end of the source document; per the user, there ARE additional entrance/general QR codes beyond the artwork ones, so these are treated as Tier 1 rather than assumed unlocked.)

## Tier 2 — no physical QR code yet, but still a real live URL: preserve exactly anyway
No excuse to drift here either (bookmarks, search engine index, shared links) — just not a "the physical world breaks" emergency if missed.
| Page (Lithuanian) | Exact path |
|---|---|
| Pirmasis Kambarys | `/pirmasis-kambarys/` |
| Antrasis Kambarys | `/antrasis-kambarys/` |
| Trečiasis Kambarys | `/treciasis-kambarys/` |
| Ketvirtasis Kambarys | `/ketvirtasis-kambarys/` |
| Penktasis Kambarys | `/penktasis-kambarys/` |
| Šeštasis Kambarys | `/sestasis-kambarys/` |

## Tier 0 — unknown, discover during scraping
- **Sunkūs Paminklai (the book)**: exact slug unknown, not in the source document. Capture it during YG-2 crawl and treat as Tier 1 (assume a QR code may exist) unless the human confirms otherwise.
- Anything else the YG-2 sitemap crawl turns up that isn't in this list at all: flag it explicitly in the inventory rather than silently dropping or silently keeping it — the human decides whether it's still needed.

## What this means architecturally (binding, not optional)
1. **Lithuanian is unprefixed at the site root** — not `/lt/...`. This breaks the originally-planned "every locale gets `/[locale]/...`" scheme for lt specifically. Fix: a route-group `app/(lt)/...` (no URL segment) serves Lithuanian at bare paths matching the table above exactly; `app/[locale]/...` (locale ∈ the other 12) serves everyone else prefixed (`/en/...`, `/ru/...`, etc. — no constraint on their shape since no QR code encodes them). Both trees render from the same shared content/components, just with `locale` fixed to `'lt'` in one and parameterized in the other. See YG-1 and YG-6.
2. **Individual artworks are real top-level WordPress pages, not entries on one big gallery page.** ~25 of them, each with its own slug (table above). The "Virtuali galerija" page is the scrolling hub/index; each artwork ALSO has its own standalone exact URL. This must be true on the new site too: `/nijoles-katinas/` (lt) is a real static page — it's the same long-scroll gallery experience with that artwork's quickview modal pre-opened (the mechanism from YG-6 is unchanged, only the URL shape moves from the originally-planned `/gallery/[slug]` to a bare top-level `/[slug]`). The hub page itself lives at `/kiemo-galerija-virtuali-galerija/`, not at a generic `/gallery` path.
3. **"Paslapčių kambariai" is a 6-page mini-narrative** (Pirmasis…Šeštasis Kambarys = First…Sixth Room), reached by clicking through from its own hub page. Preserve its structure and all 6 URLs; only the hub page (`/paslapciu-kambariai/`) is Tier 1, the 6 rooms are Tier 2.
4. **Redirects (YG-9) shrink in scope**: because these ~35 pages preserve their exact old path, they need NO entry in `_redirects` at all — there's no old-URL-to-new-URL mapping to make because the URL never changes. `_redirects` is only for content that's genuinely being restructured or removed (if any — check during YG-2 whether anything not in this list should be retired). This also sidesteps the Cloudflare `_redirects` rules-past-#100 quirk entirely for every QR-critical path.
5. **Testing gets a dedicated, non-negotiable spec** (YG-8): a `qr-locked-urls.spec.ts` that hits every single path in this document verbatim against the built `out/` and asserts 200 + plausible content. This is the highest-priority test in the whole suite — treat a failure here as a release blocker above all others.
