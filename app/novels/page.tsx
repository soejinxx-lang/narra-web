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
              <div
                style={{
                  flex: "0 0 70%",
                  background: "#e5e5e5",
                  borderRadius: 10,
                  margin: 10,
                  overflow: "hidden",
                }}
              >
                {novel.cover_url && (
                  <img
                    src={novel.cover_url}
                    alt={novel.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
