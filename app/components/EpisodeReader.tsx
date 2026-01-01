"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReadingSettings, { ReadingSettings as ReadingSettingsType } from "./ReadingSettings";

type EpisodeReaderProps = {
  episode: any;
  novel: any;
  novelId: string;
  prevEpisode: any;
  nextEpisode: any;
};

export default function EpisodeReader({
  episode,
  novel,
  novelId,
  prevEpisode,
  nextEpisode,
}: EpisodeReaderProps) {
  const [settings, setSettings] = useState<ReadingSettingsType>({
    fontSize: 16,
    lineHeight: 1.8,
    backgroundColor: "#faf9f6",
    fontFamily: "inherit",
  });

  useEffect(() => {
    // 로컬 스토리지에서 설정 불러오기
    const saved = localStorage.getItem("readingSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (e) {
        // 기본값 사용
      }
    }
  }, []);

  const handleSettingsChange = (newSettings: ReadingSettingsType) => {
    setSettings(newSettings);
  };

  const navButtonStyle = {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "1px solid #e5e5e5",
    background: "#fff",
    color: "#333",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: settings.backgroundColor,
        transition: "background 0.3s",
      }}
    >
      {/* 헤더 영역 */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e5e5",
          padding: "16px 24px",
          position: "sticky",
          top: 56,
          zIndex: 50,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <Link
            href={`/novels/${novelId}`}
            style={{
              textDecoration: "none",
              color: "#243A6E",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ← Back to Contents
          </Link>
          <ReadingSettings onSettingsChange={handleSettingsChange} />
        </div>
      </div>

      {/* 본문 영역 */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 600,
              marginBottom: "8px",
              color: settings.backgroundColor === "#1a1a1a" ? "#fff" : "#243A6E",
              fontFamily: '"KoPub Batang", serif',
            }}
          >
            EP {episode.ep} {episode.title ? `- ${episode.title}` : ""}
          </h1>
          {novel && (
            <Link
              href={`/novels/${novelId}`}
              style={{
                textDecoration: "none",
                color: settings.backgroundColor === "#1a1a1a" ? "#999" : "#666",
                fontSize: "15px",
              }}
            >
              {novel.title}
            </Link>
          )}
        </div>

        <div
          style={{
            lineHeight: settings.lineHeight,
            whiteSpace: "pre-wrap",
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily,
            color: settings.backgroundColor === "#1a1a1a" ? "#e0e0e0" : "#333",
            minHeight: "400px",
          }}
        >
          {episode.content}
        </div>

        {/* 네비게이션 영역 */}
        <div
          style={{
            marginTop: "60px",
            paddingTop: "32px",
            borderTop: "1px solid #e5e5e5",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {prevEpisode ? (
            <Link
              href={`/novels/${novelId}/episodes/${prevEpisode.ep}`}
              style={navButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#243A6E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e5e5e5";
              }}
            >
              ← Previous
            </Link>
          ) : (
            <div style={{ ...navButtonStyle, opacity: 0.5, cursor: "not-allowed" }}>
              ← Previous
            </div>
          )}

          <Link
            href={`/novels/${novelId}`}
            style={{
              ...navButtonStyle,
              borderColor: "#243A6E",
              background: "#f0f4ff",
              color: "#243A6E",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e0e8ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f0f4ff";
            }}
          >
            Contents
          </Link>

          {nextEpisode ? (
            <Link
              href={`/novels/${novelId}/episodes/${nextEpisode.ep}`}
              style={navButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#243A6E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e5e5e5";
              }}
            >
              Next →
            </Link>
          ) : (
            <div style={{ ...navButtonStyle, opacity: 0.5, cursor: "not-allowed" }}>
              Next →
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

