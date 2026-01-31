export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchEpisodesByNovelId, fetchNovelById, fetchEpisodeContent } from "@/lib/api";
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

  // 기본은 한국어만 서버에서 가져오기
  const [episode, novel, allEpisodes] = await Promise.all([
    fetchEpisode(id, ep),
    fetchNovelById(id).catch(() => null),
    fetchEpisodesByNovelId(id).catch(() => []),
  ]);

  if (!episode) {
    notFound();
  }

  // 원본 언어 콘텐츠 가져오기 (novel의 source_language 사용)
  const sourceLanguage = novel?.source_language || "ko";
  const sourceContent = await fetchEpisodeContent(id, ep, sourceLanguage).catch(() => null);
  // Ensure ID is preserved from the original episode object
  const episodeWithSource = sourceContent
    ? { ...sourceContent, ...episode, id: episode.id, ep: episode.ep }
    : episode;

  const currentIndex = allEpisodes.findIndex((e: any) => String(e.ep) === String(ep));
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  return (
    <EpisodeReader
      episode={episodeWithSource}
      novel={novel}
      novelId={id}
      prevEpisode={prevEpisode}
      nextEpisode={nextEpisode}
    />
  );
}
