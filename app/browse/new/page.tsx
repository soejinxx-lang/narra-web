// app/browse/new/page.tsx

import { fetchNovels } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function NewNovelPage() {
  const novels = await fetchNovels();

  if (!novels || novels.length === 0) {
    return null;
  }

  const latest = [...novels].sort((a, b) => {
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
        href={`/novels/${latest.id}`}
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
            {latest.cover_url && (
              <img
                src={latest.cover_url}
                alt={latest.title}
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
            {latest.title}
          </div>
        </div>
      </a>
    </div>
  );
}
