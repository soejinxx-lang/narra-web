import { fetchNovels } from "@/lib/api";
import Link from "next/link";
import NovelCard from "@/app/components/NovelCard"; // ✅ 경로만 수정

export default async function Page() {
  const novels = await fetchNovels();

  return (
    <main style={{ padding: 24 }}>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 600,
          marginBottom: "24px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        All Novels
      </h1>

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "1.2cm",
        }}
      >
        {novels.map((novel: any) => (
          <Link
            key={novel.id}
            href={`/novels/${novel.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {/* ✅ 카드 구조는 NovelCard 단일 기준 */}
            <NovelCard novel={novel} />
          </Link>
        ))}
      </div>
    </main>
  );
}
