import { fetchNovels } from "@/lib/api";
import Link from "next/link";

export default async function Page() {
  const novels = await fetchNovels();

  return (
    <main style={{ padding: 24 }}>
      <h1>All Novels</h1>

      <div style={{ marginTop: 24 }}>
        {novels.map((novel: any) => (
          <Link
            key={novel.id}
            href={`/novels/${novel.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                padding: "16px 0",
                borderBottom: "1px solid #e5e5e5",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {novel.title}
              </div>
              {novel.description && (
                <div style={{ marginTop: 4, color: "#666" }}>
                  {novel.description}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
