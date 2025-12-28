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
          borderTop: "1px solid #e5e5e5",
          borderLeft: "1px solid #e5e5e5",
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
                aspectRatio: "3 / 5",
                borderRight: "1px solid #e5e5e5",
                borderBottom: "1px solid #e5e5e5",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  flex: "0 0 65%",
                  background: "#e0e0e0",
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
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
