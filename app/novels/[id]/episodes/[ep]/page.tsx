export const runtime = "nodejs";

import { notFound } from "next/navigation";

async function fetchEpisode(id: string, ep: string) {
  const base =
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL ||
    "https://narra-storage-production.up.railway.app/api";

  const res = await fetch(`${base}/novels/${id}/episodes/${ep}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
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
