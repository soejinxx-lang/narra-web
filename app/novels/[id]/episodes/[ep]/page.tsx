export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchEpisodesByNovelId, fetchNovelById } from "@/lib/api";
import EpisodeReader from "@/app/components/EpisodeReader";

async function fetchEpisode(id: string, ep: string) {
  const episodes = await fetchEpisodesByNovelId(id);
  return episodes.find((e: any) => String(e.ep) === String(ep)) ?? null;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; ep: string }>;
}) {
  const { id, ep } = await params;

  const [episode, novel, allEpisodes] = await Promise.all([
    fetchEpisode(id, ep),
    fetchNovelById(id).catch(() => null),
    fetchEpisodesByNovelId(id).catch(() => []),
  ]);

  if (!episode) {
    notFound();
  }

  const currentIndex = allEpisodes.findIndex((e: any) => String(e.ep) === String(ep));
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  return (
    <EpisodeReader
      episode={episode}
      novel={novel}
      novelId={id}
      prevEpisode={prevEpisode}
      nextEpisode={nextEpisode}
    />
  );
}
