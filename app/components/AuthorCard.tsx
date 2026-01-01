"use client";

import Link from "next/link";

type AuthorCardProps = {
  author: {
    name: string;
    novelCount: number;
    novels: any[];
  };
};

export default function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Link
      href={`/authors/${encodeURIComponent(author.name)}`}
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
        <div
          style={{
            fontSize: "24px",
            fontWeight: 600,
            marginBottom: "12px",
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          {author.name}
        </div>
        <div style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
          {author.novelCount} {author.novelCount === 1 ? "novel" : "novels"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {author.novels.slice(0, 3).map((novel: any) => (
            <div
              key={novel.id}
              style={{
                fontSize: "13px",
                color: "#999",
                padding: "8px",
                background: "#faf9f6",
                borderRadius: "6px",
              }}
            >
              {novel.title}
            </div>
          ))}
          {author.novels.length > 3 && (
            <div style={{ fontSize: "12px", color: "#999", fontStyle: "italic" }}>
              +{author.novels.length - 3} more
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

