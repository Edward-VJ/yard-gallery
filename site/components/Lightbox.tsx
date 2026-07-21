"use client";

import { useCallback, useEffect, useRef } from "react";
import manifest from "@/lib/image-manifest.json";

type ManifestEntry = {
  width: number;
  height: number;
  variants: {
    avif: { width: number; url: string }[];
    webp: { width: number; url: string }[];
  };
};

const IMAGE_MANIFEST = manifest as Record<string, ManifestEntry>;

export type LightboxImage = { filename: string; alt: string };

// Generic fullscreen image-sequence viewer — arrow keys, mouse wheel, and
// on-screen prev/next buttons all move through `images`. Used directly by
// the History page's embedded book slideshows; the virtual gallery's
// per-artwork quickview (YG-6) reuses the same chrome/keyboard/backdrop
// pattern but navigates a different kind of sequence (artworks, not pages
// within one item), so it's a separate component built on similar
// conventions rather than this one reused as-is.
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  title,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
  title?: string;
}) {
  const wheelLockRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= images.length) return;
      onIndexChange(next);
    },
    [images.length, onIndexChange]
  );

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
      else if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, goTo, onClose]);

  function handleWheel(e: React.WheelEvent) {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaY) < 24) return;
    wheelLockRef.current = true;
    goTo(e.deltaY > 0 ? index + 1 : index - 1);
    setTimeout(() => {
      wheelLockRef.current = false;
    }, 350);
  }

  const current = images[index];
  const entry = IMAGE_MANIFEST[current.filename];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? current.alt}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
      onWheel={handleWheel}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-2xl text-white hover:border-white"
      >
        ×
      </button>

      {title && (
        <p className="label-caps absolute left-4 top-4 max-w-[60vw] text-white/80">
          {title} — {index + 1} / {images.length}
        </p>
      )}

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Previous"
        className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-3xl text-white/70 hover:text-white disabled:opacity-20 sm:left-6"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        disabled={index === images.length - 1}
        aria-label="Next"
        className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-3xl text-white/70 hover:text-white disabled:opacity-20 sm:right-6"
      >
        ›
      </button>

      {entry && (
        <picture className="mx-auto flex max-h-[85vh] max-w-[92vw] items-center justify-center">
          <source type="image/avif" srcSet={entry.variants.avif.map((v) => `${v.url} ${v.width}w`).join(", ")} />
          <source type="image/webp" srcSet={entry.variants.webp.map((v) => `${v.url} ${v.width}w`).join(", ")} />
          <img
            src={entry.variants.webp[entry.variants.webp.length - 1].url}
            alt={current.alt}
            className="max-h-[85vh] max-w-[92vw] object-contain"
          />
        </picture>
      )}
    </div>
  );
}
