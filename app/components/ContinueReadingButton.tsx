"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getNovelProgress, getCurrentUserId } from "@/app/utils/readingProgress";

type ContinueReadingButtonProps = {
  novelId: string;
};

export default function ContinueReadingButton({ novelId }: ContinueReadingButtonProps) {
  const [progress, setProgress] = useState<{ episodeEp: string; progress: number } | null>(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      setProgress(null);
      return;
    }

    const novelProgress = getNovelProgress(userId, novelId);
    if (novelProgress && novelProgress.progress > 0) {
      setProgress({
        episodeEp: novelProgress.episodeEp,
        progress: novelProgress.progress,
      });
    } else {
      setProgress(null);
    }
  }, [novelId]);

  if (!progress || progress.progress === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Option 1: Minimal + Icon */}
      <Link
        href={`/novels/${novelId}/episodes/${progress.episodeEp}`}
        style={{
          padding: "12px 24px",
          background: "transparent",
          color: "#243A6E",
          border: "2px solid #243A6E",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s",
          width: "fit-content",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#243A6E";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#243A6E";
        }}
      >
        <span>→</span> Continue Reading - EP {progress.episodeEp}
      </Link>

      {/* Option 2: Progress Bar Integrated */}
      <Link
        href={`/novels/${novelId}/episodes/${progress.episodeEp}`}
        style={{
          padding: "16px 24px",
          background: "#fff",
          color: "#243A6E",
          border: "1px solid #e5e5e5",
          borderRadius: "12px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          display: "inline-block",
          transition: "all 0.2s",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          width: "fit-content",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ marginBottom: "8px" }}>Continue Reading</div>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
          EP {progress.episodeEp} · {progress.progress}% complete
        </div>
        <div style={{ width: "200px", height: "4px", background: "#e5e5e5", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ width: `${progress.progress}%`, height: "100%", background: "#243A6E", transition: "width 0.3s" }} />
        </div>
      </Link>

      {/* Option 3: Badge Style */}
      <Link
        href={`/novels/${novelId}/episodes/${progress.episodeEp}`}
        style={{
          padding: "12px 24px",
          background: "#243A6E",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          transition: "all 0.2s",
          width: "fit-content",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1a2d5a";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#243A6E";
        }}
      >
        <span>Continue Reading</span>
        <span style={{
          background: "rgba(255,255,255,0.2)",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 700,
        }}>
          EP {progress.episodeEp}
        </span>
      </Link>

      {/* Option 4: Gradient + Shadow */}
      <Link
        href={`/novels/${novelId}/episodes/${progress.episodeEp}`}
        style={{
          padding: "14px 28px",
          background: "linear-gradient(135deg, #243A6E 0%, #3a5a9e 100%)",
          color: "#fff",
          borderRadius: "10px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          display: "inline-block",
          transition: "all 0.3s",
          boxShadow: "0 4px 15px rgba(36, 58, 110, 0.3)",
          width: "fit-content",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(36, 58, 110, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(36, 58, 110, 0.3)";
        }}
      >
        Continue Reading - EP {progress.episodeEp}
      </Link>

      {/* Option 5: Neon/Glow Effect */}
      <Link
        href={`/novels/${novelId}/episodes/${progress.episodeEp}`}
        style={{
          padding: "12px 24px",
          background: "transparent",
          color: "#243A6E",
          border: "2px solid #243A6E",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          display: "inline-block",
          transition: "all 0.3s",
          boxShadow: "0 0 10px rgba(36, 58, 110, 0.3)",
          width: "fit-content",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 20px rgba(36, 58, 110, 0.6), 0 0 30px rgba(36, 58, 110, 0.4)";
          e.currentTarget.style.borderColor = "#3a5a9e";
          e.currentTarget.style.color = "#3a5a9e";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 10px rgba(36, 58, 110, 0.3)";
          e.currentTarget.style.borderColor = "#243A6E";
          e.currentTarget.style.color = "#243A6E";
        }}
      >
        Continue Reading - EP {progress.episodeEp}
      </Link>
    </div>
  );
}

