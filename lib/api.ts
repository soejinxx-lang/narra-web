export async function fetchNovels() {
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    throw new Error("STORAGE BASE URL NOT SET");
  }

  const res = await fetch(`${base}/novels`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch novels");
  }

  const data = await res.json();
  return data.novels;
}

export async function fetchNovelById(id: string) {
  console.log("FETCH NOVEL ID:", id);

  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    throw new Error("STORAGE BASE URL NOT SET");
  }

  const res = await fetch(
    `${base}/novels/${encodeURIComponent(id)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch novel: ${id}`);
  }

  const data = await res.json();

  if (data?.novel) {
    return data.novel;
  }

  return data;
}

export async function fetchEpisodesByNovelId(id: string) {
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    throw new Error("STORAGE BASE URL NOT SET");
  }

  const res = await fetch(
    `${base}/novels/${encodeURIComponent(id)}/episodes`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch episodes for novel: ${id}`);
  }

  const data = await res.json();
  return data.episodes ?? data;
}

export async function fetchEpisodeContent(
  novelId: string,
  episodeEp: string | number,
  lang: string = "ko"
) {
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    throw new Error("STORAGE BASE URL NOT SET");
  }

  try {
    const res = await fetch(
      `${base}/novels/${encodeURIComponent(novelId)}/episodes/${encodeURIComponent(episodeEp)}?lang=${lang}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch episode content for lang ${lang}:`, error);
    return null;
  }
}