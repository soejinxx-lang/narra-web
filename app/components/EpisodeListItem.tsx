"use client";

import Link from "next/link";

type EpisodeListItemProps = {
  episode: any;
  novelId: string;
};

export default function EpisodeListItem({ episode, novelId }: EpisodeListItemProps) {
  return (
    <Link
      href={`/novels/${novelId}/episodes/${episode.ep}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        background: "#fff",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          cursor: "pointer",
          transition: "background 0.2s",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f8f9fa";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff";
        }}
      >
        <div>
          <div style={{ fontWeight: 500, fontSize: "15px", marginBottom: "4px" }}>
            EP {episode.ep} {episode.title ? `- ${episode.title}` : ""}
          </div>
          {episode.created_at && (
            <div style={{ color: "#999", fontSize: "13px" }}>
              {new Date(episode.created_at).toLocaleDateString("en-US")}
            </div>
          )}
        </div>
        <div style={{ color: "#243A6E", fontSize: "14px" }}>→</div>
      </div>
    </Link>
  );
}

