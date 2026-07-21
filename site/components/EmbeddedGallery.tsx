import { ArtImage } from "./ArtImage";

// Horizontal filmstrip for the History page's two embedded slideshow
// "books" (74 + 94 images) — inline gallery treatment, not a fullscreen
// viewer like the Sunkūs Paminklai book gets (YG-7). Native loading="lazy"
// on ArtImage's <img> defers offscreen-to-the-right images same as any
// other offscreen image, so this is fine even with ~90 images in one row.
//
// Unlike the Home page's atmospheric/decorative photos (correctly alt=""),
// these slideshow pages carry real informational content (some are text
// slides) — there's no per-image caption from the scrape to draw on, but a
// silent alt="" here would mean screen-reader users get no indication a
// 74-image gallery exists at all, so each gets a positional label instead.
export function EmbeddedGallery({ title, filenames }: { title: string; filenames: string[] }) {
  return (
    <div className="py-6">
      <p className="label-caps mb-4 text-[var(--color-muted)]">{title}</p>
      <div className="flex gap-2 overflow-x-auto px-6 pb-2 lg:px-12">
        {filenames.map((filename, i) => (
          <ArtImage
            key={filename}
            filename={filename}
            alt={`${title} — page ${i + 1} of ${filenames.length}`}
            sizes="240px"
            className="h-56 w-auto shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
