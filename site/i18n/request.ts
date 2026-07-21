import fs from "node:fs";
import path from "node:path";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "./locales";

// Content lives in the repo-root /content and /messages (see repo CLAUDE.md),
// not duplicated under site/ — read straight from there at build time.
const MESSAGES_ROOT = path.join(process.cwd(), "..", "messages");

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && (locales as readonly string[]).includes(requested)
      ? requested
      : defaultLocale;

  const messages = JSON.parse(
    fs.readFileSync(path.join(MESSAGES_ROOT, `${locale}.json`), "utf8")
  );

  return { locale, messages };
});
