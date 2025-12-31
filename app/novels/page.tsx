import { fetchNovels } from "@/lib/api";
import Link from "next/link";

export default async function Page() {
  const novels = await fetchNovels();

  return (
    <main style={{ padding: 24 }}>
      <h1>All Novels</h1>

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
            <div
              style={{
                width: "93%",
                margin: "0 auto",
                aspectRatio: "2 / 3",
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              {/* cover */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "2 / 3",
                  background: "#e5e5e5",
                  borderRadius: 10,
                  margin: 10,          // ← 테두리와 이미지 사이 여백 유지
                  overflow: "hidden",  // ← 넘치는 부분 깔끔하게 컷
                }}
              >
                {novel.cover_url && (
                  <img
                    src={novel.cover_url}
                    alt={novel.title}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",   // 🔥 핵심 수정
                      display: "block",
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  padding: "6px 10px 12px",
                  fontSize: 18,
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {novel.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
