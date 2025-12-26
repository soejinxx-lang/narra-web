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
