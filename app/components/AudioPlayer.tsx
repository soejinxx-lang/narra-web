"use client";

import { useState, useEffect, useRef } from "react";

type AudioPlayerProps = {
  novelId: string;
  episodeNumber: number;
  language: string;
};

export default function AudioPlayer({ novelId, episodeNumber, language }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "generating">("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Storage API URL (환경변수에서 가져오기)
  const STORAGE_API = process.env.NEXT_PUBLIC_STORAGE_API_URL || "https://narra-storage.railway.app";

  useEffect(() => {
    // 오디오 상태 확인
    const checkAudioStatus = async () => {
      try {
        const response = await fetch(`${STORAGE_API}/api/audio/${novelId}/${episodeNumber}/${language}`);
        if (!response.ok) {
          setStatus("error");
          return;
        }

        const data = await response.json();

        if (data.status === "DONE" && data.audio_url) {
          const resolvedUrl = data.audio_url.startsWith("http")
            ? data.audio_url
            : `${STORAGE_API}${data.audio_url}`;
          setAudioUrl(resolvedUrl);
          setStatus("ready");
        } else if (data.status === "PROCESSING" || data.status === "PENDING") {
          setStatus("generating");
          // 5초 후 다시 확인
          setTimeout(checkAudioStatus, 5000);
        } else if (data.status === "FAILED") {
          setStatus("error");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Failed to fetch audio status:", error);
        setStatus("error");
      }
    };

    checkAudioStatus();
  }, [novelId, episodeNumber, language, STORAGE_API]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "loading") {
    return (
      <div style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "12px",
        textAlign: "center",
      }}>
        <p style={{ margin: 0, color: "#666" }}>Loading audio...</p>
      </div>
    );
  }

  if (status === "generating") {
    return (
      <div style={{
        padding: "20px",
        backgroundColor: "#fff3cd",
        borderRadius: "12px",
        textAlign: "center",
      }}>
        <p style={{ margin: 0, color: "#856404" }}>
          🎙️ Generating audio narration... This may take a moment.
        </p>
      </div>
    );
  }

  if (status === "error" || !audioUrl) {
    return (
      <div style={{
        padding: "20px",
        backgroundColor: "#f8d7da",
        borderRadius: "12px",
        textAlign: "center",
      }}>
        <p style={{ margin: 0, color: "#721c24" }}>
          Audio not available for this episode.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "#243A6E",
      borderRadius: "12px",
      color: "#fff",
    }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#fff",
            color: "#243A6E",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Progress Bar */}
        <div style={{ flex: 1 }}>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              background: `linear-gradient(to right, #fff ${(currentTime / duration) * 100}%, #4a5a7e ${(currentTime / duration) * 100}%)`,
              outline: "none",
              cursor: "pointer",
            }}
          />
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            fontSize: "12px",
            color: "#ccc",
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <p style={{
        margin: "12px 0 0 0",
        fontSize: "14px",
        opacity: 0.9,
        textAlign: "center",
      }}>
        🎧 AI Voice Narration
      </p>
    </div>
  );
}