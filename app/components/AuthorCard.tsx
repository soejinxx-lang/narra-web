"use client";

import Link from "next/link";

type AuthorCardProps = {
  author: {
    id: string;
    name: string;
    bio?: string | null;
    avatar_url?: string | null;
    novel_count: string | number;
  };
};

export default function AuthorCard({ author }: AuthorCardProps) {
  const count = Number(author.novel_count) || 0;

  return (
    <Link
      href={`/authors/${author.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e5e5",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#e8e4df",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: 700,
            color: "#6b7280",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            author.name?.[0]?.toUpperCase() ?? "?"
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#243A6E",
              fontFamily: '"KoPub Batang", serif',
              marginBottom: "4px",
            }}
          >
            {author.name}
          </div>
          {author.bio && (
            <div
              style={{
                fontSize: "13px",
                color: "#999",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {author.bio}
            </div>
          )}
          <div style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}>
            {count} {count === 1 ? "novel" : "novels"}
          </div>
        </div>
      </div>
    </Link>
  );
}
