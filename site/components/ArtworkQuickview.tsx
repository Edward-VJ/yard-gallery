"use client";

import { useEffect, useRef, useState } from "react";
import manifest from "@/lib/image-manifest.json";
import type { Artwork } from "@/lib/content";

type ManifestEntry = {
  width: number;
  height: number;
  variants: {
    avif: { width: number; url: string }[];
    webp: { width: number; url: string }[];
  };
};

const IMAGE_MANIFEST = manifest as Record<string, ManifestEntry>;

function largestUrl(filename: string): string | null {
  const entry = IMAGE_MANIFEST[filename];
  if (!entry) return null;
  return entry.variants.webp[entry.variants.webp.length - 1].url;
}

// The per-artwork modal (YG-6) — near-fullscreen image, title/description,
// and (if the artwork has more than one photo) a thumbnail strip below to
// browse them. Distinct from components/Lightbox.tsx: arrow keys here move
// between ARTWORKS (a different artwork's main photo), not between an
// artwork's own extra photos — those are picked via the strip instead, so
// the two navigation actions can't collide.
export function ArtworkQuickview({
  artworks,
  index,
  onNavigate,
  onClose,
}: {
  artworks: Artwork[];
  index: number;
  onNavigate: (next: number) => void;
  onClose: () => void;
}) {
  const artwork = artworks[index];
  const [subImage, setSubImage] = useState(0);
  // This component stays mounted across artwork navigation (←/→ just
  // change `index`) so the focus-trap/scroll-lock effects below don't
  // re-run on every step — which means subImage can't reset via an effect
  // keyed on `index` without an extra render pass. Adjusting state during
  // render when a prop changes is React's documented alternative to an
  // effect for exactly this case (see "You Might Not Need an Effect").
  const [prevIndex, setPrevIndex] = useState(index);
  if (index !== prevIndex) {
    setPrevIndex(index);
    setSubImage(0);
  }
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && index < artworks.length - 1) onNavigate(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, artworks.length, onNavigate, onClose]);

  // Preload the neighboring artworks' primary photo so ←/→ feels instant.
  useEffect(() => {
    for (const neighbor of [artworks[index - 1], artworks[index + 1]]) {
      const url = neighbor && largestUrl(neighbor.images[0]?.filename);
      if (url) {
        const img = new window.Image();
        img.src = url;
      }
    }
  }, [artworks, index]);

  const currentImage = artwork.images[subImage] ?? artwork.images[0];
  const entry = IMAGE_MANIFEST[currentImage.filename];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={artwork.title}
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/95"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-2xl text-white hover:border-white"
      >
        ×
      </button>

      <button
        type="button"
        onClick={() => onNavigate(index - 1)}
        disabled={index === 0}
        aria-label="Previous artwork"
        className="fixed left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-3xl text-white/70 hover:text-white disabled:opacity-20 sm:left-6"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => onNavigate(index + 1)}
        disabled={index === artworks.length - 1}
        aria-label="Next artwork"
        className="fixed right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-3xl text-white/70 hover:text-white disabled:opacity-20 sm:right-6"
      >
        ›
      </button>

      <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center">
        {entry && (
          <picture className="flex max-h-[70vh] w-full items-center justify-center">
            <source type="image/avif" srcSet={entry.variants.avif.map((v) => `${v.url} ${v.width}w`).join(", ")} />
            <source type="image/webp" srcSet={entry.variants.webp.map((v) => `${v.url} ${v.width}w`).join(", ")} />
            <img
              src={largestUrl(currentImage.filename) ?? undefined}
              alt={currentImage.alt || artwork.title}
              className="max-h-[70vh] w-auto object-contain"
            />
          </picture>
        )}

        <div>
          <h2 className="font-serif text-2xl italic tracking-tight text-white md:text-3xl">{artwork.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">{artwork.description}</p>
        </div>

        {artwork.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {artwork.images.map((img, i) => (
              <button
                key={img.filename}
                type="button"
                onClick={() => setSubImage(i)}
                aria-label={`Photo ${i + 1} of ${artwork.images.length}`}
                aria-current={i === subImage ? "true" : undefined}
                className={`relative h-16 w-16 shrink-0 overflow-hidden border ${
                  i === subImage ? "border-white" : "border-white/20 opacity-70 hover:opacity-100"
                }`}
              >
                {IMAGE_MANIFEST[img.filename] && (
                  // eslint-disable-next-line @next/next/no-img-element -- 64px fixed thumbnail, a full responsive srcset would be overkill
                  <img
                    src={IMAGE_MANIFEST[img.filename].variants.webp[0].url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
