export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchEpisodesByNovelId } from "@/lib/api";

async function fetchEpisode(id: string, ep: string) {
  const episodes = await fetchEpisodesByNovelId(id);
  return episodes.find((e: any) => String(e.ep) === String(ep)) ?? null;
}

export default async function Page({
  params,
}: {
  params: { id: string; ep: string };
}) {
  const episode = await fetchEpisode(params.id, params.ep);

  if (!episode) {
    notFound();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>
        EP {episode.ep} {episode.title}
      </h1>

      <div style={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        {episode.content}
      </div>
    </main>
  );
}
