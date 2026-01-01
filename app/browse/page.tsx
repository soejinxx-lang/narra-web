// app/browse/page.tsx

import { fetchNovels } from "@/lib/api";
import BrowseClient from "@/app/components/BrowseClient";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const novels = await fetchNovels();
  const params = await searchParams;
  const query = params?.q || "";

  return <BrowseClient novels={novels} initialQuery={query} />;
}
