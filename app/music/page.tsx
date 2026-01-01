"use client";

import { useState } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
}

interface Tone {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
}

const royaltyFreeMusic: Tone[] = [
  {
    id: "relaxing",
    name: "Relaxing",
    description: "Calm and peaceful melodies for a tranquil reading experience",
    tracks: [
      {
        id: "r1",
        title: "Ambient Dreams",
        artist: "Royalty Free Music",
        duration: "3:45",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
      {
        id: "r2",
        title: "Peaceful Moments",
        artist: "Royalty Free Music",
        duration: "4:12",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
      {
        id: "r3",
        title: "Serene Garden",
        artist: "Royalty Free Music",
        duration: "3:28",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
      {
        id: "r4",
        title: "Tranquil Waters",
        artist: "Royalty Free Music",
        duration: "4:05",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
    ],
  },
  {
    id: "epic",
    name: "Epic",
    description: "Powerful and dramatic soundtracks for intense story moments",
    tracks: [
      {
        id: "e1",
        title: "Battle Anthem",
        artist: "Royalty Free Music",
        duration: "3:50",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
      {
        id: "e2",
        title: "Heroic Journey",
        artist: "Royalty Free Music",
        duration: "4:20",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
      {
        id: "e3",
        title: "Dragon's Call",
        artist: "Royalty Free Music",
        duration: "3:35",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
    ],
  },
  {
    id: "focus",
    name: "Focus",
    description: "Instrumental tracks to help you concentrate while reading",
    tracks: [
      {
        id: "f1",
        title: "Reading Atmosphere",
        artist: "Royalty Free Music",
        duration: "3:28",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
      {
        id: "f2",
        title: "Study Session",
        artist: "Royalty Free Music",
        duration: "4:15",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
      {
        id: "f3",
        title: "Deep Focus",
        artist: "Royalty Free Music",
        duration: "3:55",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
      {
        id: "f4",
        title: "Mindful Reading",
        artist: "Royalty Free Music",
        duration: "4:30",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
    ],
  },
  {
    id: "mystery",
    name: "Mystery",
    description: "Suspenseful and intriguing melodies for thrilling narratives",
    tracks: [
      {
        id: "m1",
        title: "Hidden Secrets",
        artist: "Royalty Free Music",
        duration: "3:40",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
      {
        id: "m2",
        title: "Dark Investigation",
        artist: "Royalty Free Music",
        duration: "4:00",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
      {
        id: "m3",
        title: "Enigmatic Path",
        artist: "Royalty Free Music",
        duration: "3:45",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
    ],
  },
];

export default function MusicPage() {
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"spotify" | "royalty" | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone | null>(null);

  const handleSpotifyConnect = () => {
    setIsSpotifyConnected(true);
    setSelectedOption("spotify");
    alert("Spotify integration is simulated. This would redirect to Spotify for login.");
  };

  const handleToneSelect = (tone: Tone) => {
    setSelectedOption("royalty");
    setSelectedTone(tone);
  };

  const handleRoyaltyFreeSelect = (track: Track) => {
    if (selectedTone) {
      // Dispatch event to global music player
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("musicPlayer_setTrack", { detail: { track } }));
      }
    }
  };

  const handleBackToTones = () => {
    setSelectedTone(null);
  };

  return (
    <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto", minHeight: "80vh" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "32px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        Music
      </h1>

      <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))" }}>
        {/* Spotify Option */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "32px",
            border: "1px solid #e5e5e5",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            🎵
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "#243A6E",
              fontFamily: '"KoPub Batang", serif',
            }}
          >
            Spotify Music
          </h2>
          <p style={{ color: "#666", marginBottom: "24px", lineHeight: 1.6 }}>
            Connect your Spotify account to listen to your favorite playlists while reading.
          </p>
          <button
            onClick={handleSpotifyConnect}
            style={{
              padding: "12px 24px",
              background: isSpotifyConnected ? "#1DB954" : "#243A6E",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isSpotifyConnected ? "#1ed760" : "#1e2f56";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isSpotifyConnected ? "#1DB954" : "#243A6E";
            }}
          >
            {isSpotifyConnected ? "✓ Connected" : "Connect to Spotify"}
          </button>
        </div>

        {/* Royalty Free Music Option */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "32px",
            border: "1px solid #e5e5e5",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            🎶
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "#243A6E",
              fontFamily: '"KoPub Batang", serif',
              textAlign: "center",
            }}
          >
            Royalty Free Music
          </h2>
          {!selectedTone ? (
            <>
              <p style={{ color: "#666", marginBottom: "24px", lineHeight: 1.6, textAlign: "center" }}>
                Choose a tone to explore our collection of royalty-free tracks.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {royaltyFreeMusic.map((tone) => (
                  <div
                    key={tone.id}
                    onClick={() => handleToneSelect(tone)}
                    style={{
                      padding: "20px",
                      background: "#faf9f6",
                      borderRadius: "12px",
                      border: "2px solid #e5e5e5",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e8ecf5";
                      e.currentTarget.style.borderColor = "#243A6E";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#faf9f6";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "18px", color: "#243A6E", marginBottom: "8px", fontFamily: '"KoPub Batang", serif' }}>
                      {tone.name}
                    </div>
                    <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.5 }}>{tone.description}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                      {tone.tracks.length} tracks
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#243A6E",
                    fontFamily: '"KoPub Batang", serif',
                  }}
                >
                  {selectedTone.name} Tracks
                </h2>
                <button
                  onClick={handleBackToTones}
                  style={{
                    background: "none",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    color: "#243A6E",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  ← Back to Tones
                </button>
              </div>
              <p style={{ color: "#666", marginBottom: "24px", lineHeight: 1.6 }}>{selectedTone.description}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedTone.tracks.map((track) => {
                  // Check if this track is currently playing
                  const isCurrentTrack = typeof window !== "undefined" && (() => {
                    try {
                      const savedTrack = localStorage.getItem("musicPlayer_track");
                      if (savedTrack) {
                        const parsed = JSON.parse(savedTrack);
                        return parsed.id === track.id;
                      }
                    } catch (e) {
                      return false;
                    }
                    return false;
                  })();

                  return (
                    <div
                      key={track.id}
                      onClick={() => handleRoyaltyFreeSelect(track)}
                      style={{
                        padding: "16px",
                        background: isCurrentTrack ? "#e8ecf5" : "#faf9f6",
                        borderRadius: "8px",
                        border: isCurrentTrack ? "2px solid #243A6E" : "1px solid #e5e5e5",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentTrack) {
                          e.currentTarget.style.background = "#f0f0f0";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentTrack) {
                          e.currentTarget.style.background = "#faf9f6";
                        }
                      }}
                    >
                      <div style={{ fontWeight: 500, marginBottom: "4px", color: "#243A6E" }}>{track.title}</div>
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        {track.artist} · {track.duration}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
