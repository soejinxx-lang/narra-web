// app/browse/recommended/page.tsx

import { fetchNovels } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function RecommendedNovelPage() {
  const novels = await fetchNovels();

  if (!novels || novels.length === 0) {
    return null;
  }

  const recommended = [...novels].sort((a, b) => {
    const ta = Number(a.id.replace("novel-", ""));
    const tb = Number(b.id.replace("novel-", ""));
    return tb - ta;
  })[0];

  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <a
        href={`/novels/${recommended.id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            width: "220px",
            aspectRatio: "2 / 3",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: "0 0 70%",
              background: "#e5e5e5",
              borderRadius: "6px",
              margin: "10px",
              overflow: "hidden",
            }}
          >
            {recommended.cover_url && (
              <img
                src={recommended.cover_url}
                alt={recommended.title}
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
              fontSize: 16,
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {recommended.title}
          </div>
        </div>
      </a>
    </div>
  );
}
