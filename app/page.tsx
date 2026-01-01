import Link from "next/link";
import { fetchNovels } from "@/lib/api";
import NovelCard from "@/app/components/NovelCard";
import NovelCarousel from "@/app/components/NovelCarousel";
import BrowseButton from "@/app/components/BrowseButton";
import styles from "./page.module.css";

export default async function Page() {
  const novels = await fetchNovels();
  
  // 인기 순위 데이터 준비
  const popular = [...novels].sort((a: any, b: any) => {
    return Number(b.id.replace("novel-", "")) - Number(a.id.replace("novel-", ""));
  });

  // 캐러셀용 상위 작품들
  const carouselNovels = popular.slice(0, 5);

  return (
    <main className={styles.main}>
      {/* 히어로 섹션 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start", marginBottom: "60px" }}>
        <div>
          <Link
            href="/novels"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className={`narra-logo ${styles.narraLogo}`} style={{ textAlign: "left" }}>
              NARRA
            </div>
          </Link>

          <p
            style={{
              marginBottom: "12px",
              marginTop: "12px",
              color: "#243A6E",
              fontSize: "20px",
              fontWeight: 500,
            }}
          >
            Where system meets editorial judgment.
          </p>

          <p style={{ marginBottom: "32px", color: "#666", fontSize: "15px" }}>
            Web novel translation & reading platform
          </p>

          {/* 캐러셀 */}
          <div style={{ maxWidth: "300px" }}>
            <NovelCarousel novels={carouselNovels} />
          </div>
        </div>

        {/* 오른쪽 기능 영역 */}
        <div style={{ position: "sticky", top: "80px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px", color: "#243A6E", fontFamily: '"KoPub Batang", serif' }}>
              Quick Stats
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 600, color: "#243A6E" }}>
                  {novels.length}
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  Total Novels
                </div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 600, color: "#243A6E" }}>
                  {popular.length > 0 ? popular.length : "-"}
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  Available Now
                </div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: 600, color: "#243A6E" }}>
                  100%
                </div>
                <div style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
                  Free Reading
                </div>
              </div>
            </div>

            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e5e5e5" }}>
              <BrowseButton />
            </div>
          </div>
        </div>
      </div>

      {/* 인기 순위 */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div className={styles.sectionTitle}>Popular Rankings</div>
          <Link
            href="/browse"
            style={{
              textDecoration: "none",
              color: "#243A6E",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            View All →
          </Link>
        </div>
        <div className={styles.sectionGrid}>
          {popular.map((novel: any, index: number) => (
            <Link
              key={novel.id}
              href={`/novels/${novel.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: "-8px",
                    left: "-8px",
                    background: index < 3 ? "#243A6E" : "#999",
                    color: "#fff",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 600,
                    zIndex: 10,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {index + 1}
                </div>
                <NovelCard novel={novel} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
