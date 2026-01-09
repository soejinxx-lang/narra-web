"use client";

import { useState, useEffect } from "react";
import { getNovelProgress, getCurrentUserId } from "@/app/utils/readingProgress";

type EpisodeProgressProps = {
  novelId: string;
  episodeEp: string;
};

export default function EpisodeProgress({ novelId, episodeEp }: EpisodeProgressProps) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      setProgress(null);
      return;
    }

    const novelProgress = getNovelProgress(userId, novelId);
    if (novelProgress && novelProgress.episodeEp === episodeEp && novelProgress.progress > 0) {
      setProgress(novelProgress.progress);
    } else {
      setProgress(null);
    }
  }, [novelId, episodeEp]);

  if (!progress || progress === 0) {
    return null;
  }

  return (
    <span
      style={{
        color: "#666",
        fontSize: "12px",
        marginLeft: "8px",
        fontWeight: 400,
      }}
    >
      ({progress}% 읽음)
    </span>
  );
}

