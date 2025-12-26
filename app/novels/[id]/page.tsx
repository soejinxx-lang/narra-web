import { notFound } from "next/navigation";

async function fetchNovel(id: string) {
  const base = process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  if (!base) {
    throw new Error("STORAGE BASE URL NOT SET");
  }

  const res = await fetch(`${base}/novels/${id}`, {
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
  params: { id: string };
}) {
  const novel = await fetchNovel(params.id);

  if (!novel) {
    notFound();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>{novel.title}</h1>
      {novel.description && (
        <p style={{ color: "#666", marginBottom: 24 }}>
          {novel.description}
        </p>
      )}
    </main>
  );
}
