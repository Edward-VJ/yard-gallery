import { getTranslations } from "next-intl/server";

// No street address was ever scraped from the old site (checked every raw
// page — none embed one), so this links to a Google Maps search by the
// gallery's own name rather than guess/fabricate an address. Plain link,
// no embedded tracker iframe, per the ticket.
const MAP_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query=Kiemo+Galerija+Kaunas";

export async function VisitingPage() {
  const t = await getTranslations("visiting");
  const paragraphs = t("body").split("\n\n");

  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pb-6 pt-14 text-center lg:px-12">
        <h1 className="font-serif text-4xl italic tracking-tight text-[var(--color-brand)] md:text-5xl">
          {t("title")}
        </h1>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-6 lg:px-12">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-6 text-lg leading-relaxed text-[var(--color-foreground)] last:mb-0">
            {p}
          </p>
        ))}
      </section>

      <section className="flex justify-center px-6 pb-16">
        <a
          href={MAP_SEARCH_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="label-caps text-[var(--color-accent)] hover:text-[var(--color-accent-secondary)]"
        >
          Kaunas, Lietuva →
        </a>
      </section>
    </main>
  );
}
