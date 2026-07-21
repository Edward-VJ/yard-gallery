"use client";

import { useState } from "react";
import { ArtImage } from "./ArtImage";
import { Lightbox } from "./Lightbox";

// Replaces the old tiny horizontal-scrolling filmstrip: just the book's
// first page + its title, click/Enter opens the full sequence (74 or 94
// pages) as a fullscreen Lightbox slideshow.
export function BookPreview({ title, filenames }: { title: string; filenames: string[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const images = filenames.map((filename, i) => ({
    filename,
    alt: `${title} — page ${i + 1} of ${filenames.length}`,
  }));

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className="group mx-auto block w-full max-w-md px-6 py-8 text-center"
      >
        <div className="relative aspect-[4/3] overflow-hidden transition-opacity group-hover:opacity-90">
          <ArtImage filename={filenames[0]} alt="" priority className="absolute inset-0 h-full w-full" />
        </div>
        <p className="label-caps mt-4 text-[var(--color-foreground)] group-hover:text-[var(--color-accent)]">
          {title}
        </p>
      </button>

      {open && (
        <Lightbox
          images={images}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setOpen(false)}
          title={title}
        />
      )}
    </>
  );
}
