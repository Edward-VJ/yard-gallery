import manifest from "@/lib/image-manifest.json";

type ManifestEntry = {
  width: number;
  height: number;
  aspectRatio: number;
  lqip: string;
  variants: {
    avif: { width: number; url: string }[];
    webp: { width: number; url: string }[];
  };
};

const IMAGE_MANIFEST = manifest as Record<string, ManifestEntry>;

// filename matches assets/registry.json's `filename` (book pages are keyed
// "book/<filename>" — see scripts/build-images.mjs).
export function ArtImage({
  filename,
  alt,
  sizes = "100vw",
  priority = false,
  className,
}: {
  filename: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const entry = IMAGE_MANIFEST[filename];
  if (!entry) {
    return null;
  }

  const avifSrcSet = entry.variants.avif.map((v) => `${v.url} ${v.width}w`).join(", ");
  const webpSrcSet = entry.variants.webp.map((v) => `${v.url} ${v.width}w`).join(", ");
  const fallback = entry.variants.webp[entry.variants.webp.length - 1];

  return (
    <picture
      className={className}
      style={{
        display: "block",
        aspectRatio: `${entry.width} / ${entry.height}`,
        backgroundImage: `url(${entry.lqip})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={fallback.url}
        srcSet={webpSrcSet}
        sizes={sizes}
        alt={alt}
        width={entry.width}
        height={entry.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </picture>
  );
}
