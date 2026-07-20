# YG-4: Translation system + all locale files

## Goal
Clean i18n content for 13 locales, translated fresh from the Lithuanian source (NOT from the 3-year-old ChatGPT English), loaded through next-intl with a single language switcher.

## Locales
`lt` (source of truth), `en`, `ru`, `pl`, `uk`, `de`, `fr`, `es`, `pt`, `it`, `ja`, `zh` (simplified), `ko`.

## Steps
1. From the YG-2 archive, extract ALL Lithuanian text into structured source files:
   - `messages/lt.json` — UI strings + page copy, keyed by page/section (`history.title`, `visiting.rules.1`, …)
   - `content/artworks.lt.json` — per-artwork: title, description, artist/year if present, image refs
   - `content/book.lt.json` — Sunkūs Paminklai title/intro/any per-page text
   The Lithuanian text is copied VERBATIM from the site — no rewriting.
2. Diff the old English pages against the Lithuanian source; note mistranslations/omissions in `plan/translation-audit.md` (the old EN is reference only, not a source).
3. Translate lt → en first, fresh, using Claude in this session (not the old EN). Preserve proper nouns: Kiemo Galerija ("Yard Gallery" on first mention), Vytenis Jakas, Kaunas, Sunkūs Paminklai ("Heavy Monuments" gloss). Keep the memorial context (honoring the courtyard's former Jewish residents) accurate and respectful — this content is historically sensitive; accuracy over flourish.
4. Translate lt → each remaining locale (en as a cross-check, lt as source). One locale at a time, full file, consistent key structure. For ja/zh/ko transliterate proper nouns sensibly on first mention with the Latin original in parentheses.
5. Validation script `scripts/check-i18n.mjs`: every locale file has exactly the same key set as `lt.json`, no empty values, no leftover Lithuanian in non-lt files (heuristic: Lithuanian-specific chars ėęįųū in non-lt values), no `{placeholder}` mismatches. Wire into CI.
6. Native-review pass note: flag in the ticket for the human that `lt`, `en`, `ru`, `pl` are the high-traffic locales worth a human skim; provide a compact review doc per locale (`plan/review/<locale>.md`) with source next to translation.
7. Language switcher requirements (implemented in YG-5, defined here): dropdown in header listing each language in its own tongue (Lietuvių, English, Русский, Polski, Українська, Deutsch, Français, Español, Português, Italiano, 日本語, 中文, 한국어); switching keeps the user on the equivalent page; choice persisted in localStorage; default = browser Accept-Language, fallback lt.

## Acceptance criteria
- 13 complete, key-identical message/content files; CI i18n check green.
- English is demonstrably re-translated from Lithuanian (audit doc lists what the old EN got wrong).
- Human sign-off requested on lt/en/ru/pl review docs.
