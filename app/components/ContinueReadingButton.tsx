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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
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
            display: "inline-block",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1a2d5a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#243A6E";
          }}
        >
          Continue Reading - EP {progress.episodeEp}
        </Link>
      </div>
    </div>
  );
}

