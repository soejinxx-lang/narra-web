import Link from "next/link";
import { fetchNovels } from "@/lib/api";
import NovelCard from "@/components/NovelCard"; // ✅ 추가

export default async function Page() {
  const novels = await fetchNovels();
  const featured = novels.slice(0, 5);

  return (
    <main
      style={{
        padding: "24px",
        background: "#faf9f6",
        minHeight: "100vh",
      }}
    >
      <Link
        href="/novels"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          className="narra-logo"
          style={{
            fontSize: "32px",
            marginBottom: "8px",
            cursor: "pointer",
          }}
        >
          NARRA
        </div>
      </Link>

      <p
        style={{
          marginBottom: "12px",
          color: "#243A6E",
          fontSize: "18px",
          fontWeight: 500,
        }}
      >
        Where system meets editorial judgment.
      </p>

      <p style={{ marginBottom: "40px", color: "#666" }}>
        Web novel translation & reading platform
      </p>

      <section>
        <div
          style={{
            marginBottom: "16px",
            fontSize: "14px",
            color: "#999",
            letterSpacing: "0.04em",
          }}
        >
          FEATURED NOVELS
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1.2cm",
          }}
        >
          {featured.map((novel: any) => (
            <Link
              key={novel.id}
              href={`/novels/${novel.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {/* ✅ 카드 구조 전부 NovelCard로 위임 */}
              <NovelCard novel={novel} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
