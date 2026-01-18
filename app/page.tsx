import Link from "next/link";
import { fetchNovels } from "@/lib/api";
import NovelCardWithTracking from "@/app/components/NovelCardWithTracking";
import NovelCarousel from "@/app/components/NovelCarousel";
import FeatureGrid from "@/app/components/FeatureGrid";
import PopularRankings from "@/app/components/PopularRankings";
import ReadingNovels from "@/app/components/ReadingNovels";
import styles from "@/app/components/HomeLayout.module.css";

export default async function Page() {
  const novels = await fetchNovels();

  // 캐러셀용 상위 작품들
  const carouselNovels = novels.slice(0, 5);

  return (
    <main
      style={{
        padding: "32px 24px 80px 24px",
        background: "#faf9f6",
        minHeight: "100vh",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <div className={styles.homeGrid}>
        {/* 왼쪽: 로고, 문구, 기능 그리드 */}
        <div className={styles.leftSection}>
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
            Web novels that feel written just for you.
          </p>

          <p style={{ marginBottom: "32px", color: "#666", fontSize: "15px" }}>
            Discover stories from around the world.
          </p>

          {/* 기능 그리드 */}
          <FeatureGrid />
        </div>

        {/* 오른쪽: 캐러셀 */}
        <div className={styles.carouselSection}>
          <NovelCarousel novels={carouselNovels} />
        </div>
      </div>

      {/* 읽고 있는 작품 */}
      <ReadingNovels allNovels={novels} />

      {/* 인기 순위 */}
      <PopularRankings novels={novels} />
    </main>
  );
}
