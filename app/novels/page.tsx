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
          gap: 24,
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
                aspectRatio: "3 / 5",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  flex: "0 0 65%",
                  background: "#e5e5e5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <div
                style={{
                  flex: "1 1 auto",
                  paddingTop: 8,
                  fontSize: 16,
                  fontWeight: 600,
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
