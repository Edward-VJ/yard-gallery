import type { Metadata } from "next";
import Link from "next/link";
import { typewriter } from "@/lib/fonts";
import "./globals.css";

// The TRUE static-export 404 (out/404.html — what Cloudflare Pages actually
// serves for any dead link). No routing context reaches this file at all
// (see next.config.ts's globalNotFound comment for why), so there's no
// locale to key off of — text is hardcoded bilingual (LT + EN) rather than
// guessing a language, same reasoning as the header's old bilingual donate
// line before that was fixed to be locale-aware. This file must be a full
// HTML document and bring its own styles/fonts (per Next's own docs for
// global-not-found.js) since it bypasses both root layouts entirely.
export const metadata: Metadata = {
  title: "Puslapis nerastas / Page Not Found — Kiemo Galerija",
};

export default function GlobalNotFound() {
  return (
    <html lang="lt" className={typewriter.variable}>
      <body className="bg-[var(--color-background)] text-[var(--color-foreground)]">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, no locale/manifest context reaches this file */}
          <img src="/icon.png" alt="" className="mb-8 h-16 w-16" />
          <h1 className="font-serif text-3xl italic tracking-tight text-[var(--color-brand)] md:text-4xl">
            Puslapis nerastas
            <br />
            Page Not Found
          </h1>
          <p className="mt-6 text-lg leading-relaxed">
            Šio puslapio nėra arba jis buvo perkeltas.
            <br />
            This page doesn&apos;t exist or has been moved.
          </p>
          <Link href="/" className="donate-button mt-10">
            Grįžti į pradžią / Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
