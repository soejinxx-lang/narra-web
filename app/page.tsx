import Link from "next/link";
import { fetchNovels } from "@/lib/api";
import NovelCardWithTracking from "@/app/components/NovelCardWithTracking";
import NovelCarousel from "@/app/components/NovelCarousel";
import FeatureGrid from "@/app/components/FeatureGrid";
import PopularRankings from "@/app/components/PopularRankings";

export default async function Page() {
  const novels = await fetchNovels();

  // 캐러셀용 상위 작품들
  const carouselNovels = novels.slice(0, 5);

  return (
    <main
      style={{
        padding: "32px 24px",
        background: "#faf9f6",
        minHeight: "100vh",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start", marginBottom: "60px" }}>
        {/* 왼쪽: 로고, 문구, 기능 그리드 */}
        <div style={{ marginRight: "auto", maxWidth: "600px", marginLeft: "-1.3cm" }}>
          <Link
            href="/novels"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="narra-logo"
              style={{
                fontSize: "32px",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
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

          {/* 기능 그리드 */}
          <FeatureGrid />
        </div>

        {/* 오른쪽: 캐러셀 */}
        <div style={{ position: "sticky", top: "80px" }}>
          <NovelCarousel novels={carouselNovels} />
        </div>
      </div>

      {/* 인기 순위 */}
      <PopularRankings novels={novels} />
    </main>
  );
}
