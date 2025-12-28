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
          gap: "0.9cm",
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
                width: "100%",
                aspectRatio: "2 / 3",
                border: "1px solid #e5e5e5",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  flex: "0 0 70%",
                  background: "#e5e5e5",
                  borderRadius: 6,
                }}
              />

              <div
                style={{
                  paddingTop: 10,
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
