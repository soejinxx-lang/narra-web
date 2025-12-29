// app/browse/page.tsx

import Link from "next/link";

export default function BrowsePage() {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Link
        href="/browse/new"
        style={{
          textDecoration: "none",
          color: "black",
          border: "1px solid #e5e5e5",
          padding: "16px",
          borderRadius: "8px",
          background: "#fff",
        }}
      >
        New
      </Link>

      <Link
        href="/browse/recommended"
        style={{
          textDecoration: "none",
          color: "black",
          border: "1px solid #e5e5e5",
          padding: "16px",
          borderRadius: "8px",
          background: "#fff",
        }}
      >
        Recommend
      </Link>
    </div>
  );
}
