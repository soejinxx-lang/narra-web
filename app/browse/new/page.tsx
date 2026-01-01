// app/browse/new/page.tsx

import { fetchNovels } from "@/lib/api";
import Link from "next/link";
import NovelCard from "@/app/components/NovelCard";

export const dynamic = "force-dynamic";

export default async function NewNovelPage() {
  const novels = await fetchNovels();

  if (!novels || novels.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", color: "#999" }}>
        No novels available.
      </div>
    );
  }

  const latest = [...novels].sort((a, b) => {
    const ta = Number(a.id.replace("novel-", ""));
    const tb = Number(b.id.replace("novel-", ""));
    return tb - ta;
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "32px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        New Novels
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "20px",
        }}
      >
        {latest.map((novel: any) => (
          <Link
            key={novel.id}
            href={`/novels/${novel.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <NovelCard novel={novel} />
          </Link>
        ))}
      </div>
    </div>
  );
}
