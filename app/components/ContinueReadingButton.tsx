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
    <div style={{ marginBottom: "24px" }}>
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

