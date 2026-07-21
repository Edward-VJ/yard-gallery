import type { Metadata } from "next";
import { ltArtworkMetadata, LtArtworkPage } from "@/components/LtArtworkPage";

const SLUG = "penktasis-kambarys";

export async function generateMetadata(): Promise<Metadata> {
  return ltArtworkMetadata(SLUG);
}

export default async function Page() {
  return <LtArtworkPage slug={SLUG} />;
}
