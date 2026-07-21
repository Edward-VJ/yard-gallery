import { getMessages, getTranslations } from "next-intl/server";
import { ArtImage } from "./ArtImage";
import { EmbeddedGallery } from "./EmbeddedGallery";

type GalleryMeta = { title: string; imagePrefix: string; imageCount: number };

// The two embedded slideshow "books" on the History page (74 + 94 images) —
// numbering conventions differ per book (confirmed against the actual
// manifest keys), so each gets its own filename-generating function rather
// than one shared formula.
function galleryFilenames(index: number, meta: GalleryMeta): string[] {
  if (index === 0) {
    // Unpadded, 0-indexed: prefix0.png .. prefix73.png
    return Array.from({ length: meta.imageCount }, (_, i) => `${meta.imagePrefix}${i}.png`);
  }
  // Zero-padded 2-digit, 1-indexed: prefix01.png .. prefix94.png
  return Array.from({ length: meta.imageCount }, (_, i) => `${meta.imagePrefix}${String(i + 1).padStart(2, "0")}.png`);
}

// A key photo interleaved after the intro, art-nouveau style — reusing one
// of the same curated shots featured on the Home page.
const INTERLEAVED_PHOTO = "holly-trinity-1.jpg";

export async function HistoryPage() {
  const t = await getTranslations("history");
  // Only the first paragraph is real narrative text — the rest of the
  // \n\n-joined intro string is just the two book titles again, verbatim,
  // duplicating galleries[].title below (confirmed against the source
  // content), so they're dropped here rather than shown twice.
  const [introParagraph] = t("intro").split("\n\n");
  // next-intl's translator only returns strings — the galleries array (a
  // list of objects) comes from the raw messages object instead.
  const messages = await getMessages();
  const galleries = (messages.history as { galleries: GalleryMeta[] }).galleries;

  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pb-6 pt-14 text-center lg:px-12">
        <h1 className="font-serif text-4xl italic tracking-tight text-[var(--color-brand)] md:text-5xl">
          {t("title")}
        </h1>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-6 lg:px-12">
        <p className="text-lg leading-relaxed text-[var(--color-foreground)]">{introParagraph}</p>
        <div className="relative my-10 aspect-video overflow-hidden">
          <ArtImage filename={INTERLEAVED_PHOTO} alt="" sizes="(min-width: 768px) 768px, 100vw" className="absolute inset-0 h-full w-full" />
        </div>
      </section>

      {galleries.map((gallery, i) => (
        <EmbeddedGallery key={gallery.imagePrefix} title={gallery.title} filenames={galleryFilenames(i, gallery)} />
      ))}
    </main>
  );
}
