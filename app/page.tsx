import Link from "next/link";
import { fetchNovels } from "@/lib/api";

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
              <div
                style={{
                  width: "93%",
                  margin: "0 auto",
                  /* ❌ aspectRatio 제거됨 */
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* cover */}
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "2 / 3",
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
                      loading="lazy"
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
                  {novel.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
