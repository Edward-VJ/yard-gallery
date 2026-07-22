"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArtImage } from "./ArtImage";
import { ArtworkQuickview } from "./ArtworkQuickview";
import type { Artwork } from "@/lib/content";
import type { Locale } from "@/i18n/locales";
import { pathFor, pathForArtwork } from "@/lib/routes";

// The long-scroll gallery + quickview modal (YG-6), shared by the hub page
// and every individual artwork page — same component, same full artworks
// list, only `initialSlug` differs. All modal open/close/navigate state
// lives here and updates the URL via plain history.pushState rather than
// Next's router: a real navigation would tear down and re-render this
// component, losing scroll position, which is the one hard requirement
// this whole feature exists to satisfy.
export function GalleryClient({
  artworks,
  locale,
  initialSlug,
}: {
  artworks: Artwork[];
  locale: Locale;
  initialSlug?: string;
}) {
  const initialIndex = initialSlug
    ? artworks.findIndex((a) => a.slug === initialSlug || a.aliasSlugs.includes(initialSlug))
    : -1;
  const [openIndex, setOpenIndex] = useState<number | null>(initialIndex >= 0 ? initialIndex : null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasScrolledToInitial = useRef(false);

  const openArtwork = useCallback(
    (index: number) => {
      setOpenIndex(index);
      window.history.pushState({ gallerySlug: artworks[index].slug }, "", pathForArtwork(artworks[index].slug, locale));
    },
    [artworks, locale]
  );

  const closeArtwork = useCallback(() => {
    setOpenIndex(null);
    window.history.pushState({ gallerySlug: null }, "", pathFor("gallery", locale));
  }, [locale]);

  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname;
      const found = artworks.findIndex((a) => pathForArtwork(a.slug, locale) === path);
      setOpenIndex(found >= 0 ? found : null);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [artworks, locale]);

  // Cold start on an individual artwork's own page (e.g. a QR scan landing
  // directly on /nijoles-katinas/): scroll the underlying grid to that
  // artwork once, so closing the modal reveals it in context instead of
  // dropping the visitor at the top of a 32-artwork list.
  useEffect(() => {
    if (!hasScrolledToInitial.current && initialIndex >= 0) {
      hasScrolledToInitial.current = true;
      itemRefs.current[initialIndex]?.scrollIntoView({ block: "center" });
    }
  }, [initialIndex]);

  // Subtle scroll-reveal (YG-6 step 2). Toggles a class directly via the
  // DOM (not React state) since it's a one-way, per-element visual effect
  // with no other state depending on it — avoids 32 re-renders as the user
  // scrolls. prefers-reduced-motion is handled entirely in CSS (see
  // .gallery-item in globals.css), not branched here, so it applies even
  // if this effect never runs (e.g. hydration hasn't finished yet).
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("gallery-item-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    for (const el of itemRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [artworks]);

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 py-14 lg:px-12">
        {artworks.map((artwork, i) => (
          <div
            key={artwork.slug}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="gallery-item mb-20 last:mb-0"
          >
            <button type="button" onClick={() => openArtwork(i)} className="group block w-full text-left">
              <div className="relative aspect-[4/3] overflow-hidden">
                <ArtImage
                  filename={artwork.images[0].filename}
                  alt={artwork.images[0].alt || artwork.title}
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="absolute inset-0 h-full w-full transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
                />
              </div>
              <h2 className="label-caps mt-4 text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-accent)]">
                {artwork.title}
              </h2>
            </button>
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <ArtworkQuickview artworks={artworks} index={openIndex} onNavigate={openArtwork} onClose={closeArtwork} />
      )}
    </>
  );
}
