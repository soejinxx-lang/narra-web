"use client";

import { useMemo } from "react";
import NovelCardWithTracking from "./NovelCardWithTracking";
import Link from "next/link";
import { getNovelClicks } from "@/app/utils/clickTracking";

type PopularRankingsProps = {
  novels: any[];
};

export default function PopularRankings({ novels }: PopularRankingsProps) {
  const popular = useMemo(() => {
    const clicks = getNovelClicks();
    
    return [...novels].sort((a, b) => {
      const clicksA = clicks[a.id] || 0;
      const clicksB = clicks[b.id] || 0;
      
      if (clicksB !== clicksA) {
        return clicksB - clicksA;
      }
      
      // 클릭 수가 같으면 ID 기반 정렬
      return Number(b.id.replace("novel-", "")) - Number(a.id.replace("novel-", ""));
    });
  }, [novels]);

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#243A6E",
            marginBottom: "20px",
            paddingBottom: "12px",
            borderBottom: "2px solid #243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          Popular Rankings
        </div>
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "20px",
        }}
      >
        {popular.map((novel: any, index: number) => (
          <div key={novel.id} style={{ position: "relative" }}>
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
            <NovelCardWithTracking novel={novel} />
          </div>
        ))}
      </div>
    </section>
  );
}

