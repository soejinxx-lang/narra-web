"use client";

import { useState, useEffect, useRef } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
}

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Load player state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTrack = localStorage.getItem("musicPlayer_track");
      const savedPosition = localStorage.getItem("musicPlayer_position");
      const savedVolume = localStorage.getItem("musicPlayer_volume");
      const savedTime = localStorage.getItem("musicPlayer_currentTime");

      if (savedTrack) {
        try {
          setCurrentTrack(JSON.parse(savedTrack));
        } catch (e) {
          console.error("Error parsing saved track:", e);
        }
      }
      if (savedPosition) {
        try {
          setPlayerPosition(JSON.parse(savedPosition));
        } catch (e) {
          console.error("Error parsing saved position:", e);
        }
      }
      if (savedVolume) {
        setVolume(parseFloat(savedVolume));
      }
    }
  }, []);

  // Save track to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentTrack) {
        localStorage.setItem("musicPlayer_track", JSON.stringify(currentTrack));
      } else {
        localStorage.removeItem("musicPlayer_track");
      }
    }
  }, [currentTrack]);

  // Save position to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && currentTrack) {
      localStorage.setItem("musicPlayer_position", JSON.stringify(playerPosition));
    }
  }, [playerPosition, currentTrack]);

  // Save volume to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("musicPlayer_volume", volume.toString());
    }
  }, [volume]);

  // Listen for track updates from other components
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleTrackUpdate = (e: CustomEvent) => {
        setCurrentTrack(e.detail.track);
        setIsPlaying(true);
      };

      window.addEventListener("musicPlayer_setTrack" as any, handleTrackUpdate as EventListener);
      return () => {
        window.removeEventListener("musicPlayer_setTrack" as any, handleTrackUpdate as EventListener);
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      const savedTime = localStorage.getItem("musicPlayer_currentTime");
      if (savedTime) {
        audioRef.current.currentTime = parseFloat(savedTime);
      }
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (typeof window !== "undefined") {
        localStorage.setItem("musicPlayer_currentTime", audio.currentTime.toString());
      }
    };

    audio.addEventListener("timeupdate", updateTime);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [currentTrack]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(error => {
          console.error("Play failed:", error);
          setIsPlaying(false);
        }).then(() => {
          setIsPlaying(true);
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "BUTTON" || target.closest("button") || target.closest("input")) {
      return;
    }
    
    if (playerRef.current) {
      setIsDragging(true);
      const rect = playerRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && playerRef.current) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        const playerWidth = playerRef.current.offsetWidth || 420;
        const playerHeight = playerRef.current.offsetHeight || 200;
        const maxX = window.innerWidth - playerWidth;
        const maxY = window.innerHeight - playerHeight;
        setPlayerPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    const checkBounds = () => {
      if (playerRef.current) {
        const rect = playerRef.current.getBoundingClientRect();
        const playerWidth = rect.width;
        const playerHeight = rect.height;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let newX = playerPosition.x;
        let newY = playerPosition.y;

        if (rect.right < 0 || rect.left > windowWidth || rect.bottom < 0 || rect.top > windowHeight) {
          newX = Math.max(0, windowWidth - playerWidth - 20);
          newY = Math.max(0, windowHeight - playerHeight - 20);
        } else {
          if (rect.right > windowWidth) newX = windowWidth - playerWidth;
          if (rect.left < 0) newX = 0;
          if (rect.bottom > windowHeight) newY = windowHeight - playerHeight;
          if (rect.top < 0) newY = 0;
        }

        if (newX !== playerPosition.x || newY !== playerPosition.y) {
          setPlayerPosition({ x: newX, y: newY });
        }
      }
    };

    window.addEventListener("resize", checkBounds);
    checkBounds();

    return () => window.removeEventListener("resize", checkBounds);
  }, [playerPosition]);

  const getTotalDuration = () => {
    if (!audioRef.current) return 0;
    return audioRef.current.duration || 0;
  };

  if (!currentTrack) return null;

  return (
    <>
      <audio ref={audioRef} />
      <div
        ref={playerRef}
        style={{
          position: "fixed",
          left: `${playerPosition.x}px`,
          top: `${playerPosition.y}px`,
          width: "420px",
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #e5e5e5",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          zIndex: 1000,
          cursor: isDragging ? "grabbing" : "grab",
          boxSizing: "border-box",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentTrack(null);
            setIsPlaying(false);
            if (typeof window !== "undefined") {
              localStorage.removeItem("musicPlayer_track");
              localStorage.removeItem("musicPlayer_currentTime");
            }
          }}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#999",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            transition: "background 0.2s, color 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f0f0f0";
            e.currentTarget.style.color = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#999";
          }}
        >
          ×
        </button>

        {/* Track Info */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontWeight: 600, fontSize: "16px", color: "#243A6E", marginBottom: "4px" }}>
            {currentTrack.title}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>{currentTrack.artist}</div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "12px" }}>
          <input
            type="range"
            min="0"
            max={getTotalDuration() || 100}
            value={currentTime}
            onChange={handleSeek}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              background: "#e5e5e5",
              outline: "none",
              cursor: "pointer",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999", marginTop: "4px" }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(getTotalDuration())}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "nowrap", width: "100%" }}>
          <button
            onClick={handlePlayPause}
            style={{
              background: "#243A6E",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: "18px",
              padding: 0,
            }}
          >
            {isPlaying ? (
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="4" height="16" rx="1" fill="white"/>
                <rect x="10" width="4" height="16" rx="1" fill="white"/>
              </svg>
            ) : (
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "2px" }}>
                <path d="M0 0.8C0 0.163522 0.724318 -0.244409 1.26393 0.106024L13.5639 7.30602C14.0484 7.62467 14.0484 8.37533 13.5639 8.69398L1.26393 15.894C0.724318 16.2444 0 15.8365 0 15.2V0.8Z" fill="white"/>
              </svg>
            )}
          </button>

          {/* Volume Control */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <span style={{ fontSize: "16px", flexShrink: 0 }}>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                width: "70px",
                height: "4px",
                borderRadius: "2px",
                background: "#e5e5e5",
                outline: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

