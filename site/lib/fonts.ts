import { Courier_Prime } from "next/font/google";

// Self-hosted at build time (no external requests, no layout shift). One
// typewriter-styled font used site-wide (headings and body both map to it —
// see the --font-sans / --font-serif tokens in globals.css) per the human's
// direction to move away from the Newsreader/Epilogue serif/sans pairing.
// Cyrillic/CJK locales fall back to the generic monospace/serif in the
// @theme font stack, since Courier Prime doesn't cover those scripts.
export const typewriter = Courier_Prime({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-typewriter",
  display: "swap",
});
