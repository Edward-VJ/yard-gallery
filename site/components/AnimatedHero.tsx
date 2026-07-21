"use client";

import { useEffect, useRef, useState } from "react";
import { ArtImage } from "./ArtImage";

// Scroll-driven "bento grid" reveal, ported from the Evasion e-commerce
// template (components/sections/hero-section.tsx in the source zip the
// human provided) — same mechanics, our own 4 photos and title. Pinned via
// `sticky` for the h-[200vh] scroll runway below: the center photo shrinks
// from full-bleed down to ~42%/70%, while two side columns (2 photos each)
// slide in from the left/right edges as the user scrolls.
const SIDE_IMAGES = [
  { filename: "white-house-pretty.jpg", position: "left" as const },
  { filename: "picture9.jpg", position: "left" as const },
  { filename: "rooms-of-secrets-1.jpg", position: "right" as const },
  { filename: "cat-painting-2.jpg", position: "right" as const },
];

export function AnimatedHero({
  title,
  eyebrow,
  heroImage,
}: {
  title: string;
  eyebrow: string;
  heroImage: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = window.innerHeight * 2;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Title fades out first (0 to 0.2 of the scroll runway).
  const textOpacity = Math.max(0, 1 - scrollProgress / 0.2);
  // Image transforms start once the title has faded (0.2 to 1).
  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));

  const centerWidth = 100 - imageProgress * 58; // 100% -> 42%
  const centerHeight = 100 - imageProgress * 30; // 100% -> 70%
  const sideWidth = imageProgress * 22; // 0% -> 22%
  const sideOpacity = imageProgress;
  const sideTranslateLeft = -100 + imageProgress * 100; // -100% -> 0%
  const sideTranslateRight = 100 - imageProgress * 100; // 100% -> 0%
  const borderRadius = imageProgress * 24;
  const gap = imageProgress * 16;
  const sideTranslateY = -(imageProgress * 15);

  return (
    <section ref={sectionRef} className="relative bg-[var(--color-background)]">
      {/*
        top-[120px], not top-0: the site header is ALSO position:sticky at
        top:0 with a higher z-index, so at top-0 this box and the header
        would both pin to the same spot and the header would paint over
        the top of the bento grid. 120px ~ the header's own rendered height
        (measured ~116px) — if the header's height changes, this needs to
        move with it. h-[calc(100vh-120px)] keeps the box's bottom edge
        flush with the viewport bottom instead of overhanging past it.
      */}
      <div className="sticky top-[120px] h-[calc(100vh-120px)] overflow-hidden">
        <div className="flex h-full w-full items-center justify-center">
          {/*
            Matches the original Evasion source exactly (items-stretch,
            no align-self override on the center image) — the side columns
            need stretch just to get a height at all (their flex-1 children
            have no other way to size), and the center image ends up
            correctly inset between them, not flush with either edge.
            Any "too much whitespace before the next section" issue is
            handled on that next section's own margin, not by changing
            this composition.
          */}
          <div
            className="relative flex h-full w-full items-stretch justify-center"
            style={{ gap: `${gap}px`, padding: `${imageProgress * 16}px`, paddingBottom: `${60 + imageProgress * 40}px` }}
          >
            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateLeft}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {SIDE_IMAGES.filter((img) => img.position === "left").map((img) => (
                <div
                  key={img.filename}
                  className="relative flex-1 overflow-hidden will-change-transform"
                  style={{ borderRadius: `${borderRadius}px` }}
                >
                  <ArtImage filename={img.filename} alt="" priority sizes="22vw" className="absolute inset-0 h-full w-full" />
                </div>
              ))}
            </div>

            <div
              className="relative overflow-hidden will-change-transform"
              style={{ width: `${centerWidth}%`, height: `${centerHeight}%`, flex: "0 0 auto", borderRadius: `${borderRadius}px` }}
            >
              <ArtImage filename={heroImage} alt="" priority sizes="100vw" className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />

              <div
                className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
                style={{ opacity: textOpacity }}
              >
                <p className="label-caps text-[var(--color-accent-secondary)]">{eyebrow}</p>
                <h1
                  className="mt-3 flex flex-wrap justify-center font-serif italic tracking-tight text-white drop-shadow-md"
                  style={{ fontSize: "clamp(2rem, 9vw, 7rem)" }}
                >
                  {title.split("").map((letter, index) => (
                    <span
                      key={index}
                      className="inline-block [animation:slideUp_0.8s_ease-out_forwards] opacity-0"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {letter === " " ? " " : letter}
                    </span>
                  ))}
                </h1>
              </div>
            </div>

            <div
              className="flex flex-col will-change-transform"
              style={{
                width: `${sideWidth}%`,
                gap: `${gap}px`,
                transform: `translateX(${sideTranslateRight}%) translateY(${sideTranslateY}%)`,
                opacity: sideOpacity,
              }}
            >
              {SIDE_IMAGES.filter((img) => img.position === "right").map((img) => (
                <div
                  key={img.filename}
                  className="relative flex-1 overflow-hidden will-change-transform"
                  style={{ borderRadius: `${borderRadius}px` }}
                >
                  <ArtImage filename={img.filename} alt="" priority sizes="22vw" className="absolute inset-0 h-full w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll runway that drives the animation above via sticky pinning. */}
      <div className="h-[200vh]" />
    </section>
  );
}
