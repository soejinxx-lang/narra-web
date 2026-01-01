// app/browse/recommended/page.tsx

import { fetchNovels } from "@/lib/api";
import Link from "next/link";
import NovelCard from "@/app/components/NovelCard";

export const dynamic = "force-dynamic";

export default async function RecommendedNovelPage() {
  const novels = await fetchNovels();

  if (!novels || novels.length === 0) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", color: "#999" }}>
        No recommended novels available.
      </div>
    );
  }

  // 추천 소설은 인기도 기반으로 정렬 (임시로 ID 기반)
  const recommended = [...novels].sort((a, b) => {
    const ta = Number(a.id.replace("novel-", ""));
    const tb = Number(b.id.replace("novel-", ""));
    return tb - ta;
  }).slice(0, 20); // 상위 20개

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
        Recommended Novels
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "20px",
        }}
      >
        {recommended.map((novel: any, index: number) => (
          <Link
            key={novel.id}
            href={`/novels/${novel.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ position: "relative" }}>
              {index < 3 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#243A6E",
                    color: "#fff",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 600,
                    zIndex: 10,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {index + 1}
                </div>
              )}
              <NovelCard novel={novel} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
