"use client";

import { useState, useEffect } from "react";
import { getEpisodeProgress, getCurrentUserId } from "@/app/utils/readingProgress";

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

    // 변경된 함수 사용: 에피소드별 진도율 가져오기
    const epProgress = getEpisodeProgress(userId, novelId, episodeEp);

    if (epProgress && epProgress > 0) {
      setProgress(epProgress);
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
      ({progress}% read)
    </span>
  );
}

