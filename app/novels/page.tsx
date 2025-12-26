import { fetchNovels } from "@/lib/api";

export default async function Page() {
  const novels = await fetchNovels();

  return (
    <main style={{ padding: 24 }}>
      <h1>All Novels</h1>

      <div style={{ marginTop: 24 }}>
        {novels.map((novel: any) => (
          <div
            key={novel.id}
            style={{
              padding: "16px 0",
              borderBottom: "1px solid #e5e5e5",
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
        ))}
      </div>
    </main>
  );
}
