import Link from "next/link";

export default function Page() {
  return (
    <main
      style={{
        padding: "24px",
        background: "#faf9f6",
        minHeight: "100vh",
      }}
    >
      <Link
        href="/novel"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          className="narra-logo"
          style={{
            fontSize: "32px",
            marginBottom: "8px",
            cursor: "pointer",
          }}
        >
          NARRA
        </div>
      </Link>

      <p style={{ marginBottom: "32px", color: "#666" }}>
        Web novel translation & reading platform
      </p>
    </main>
  );
}
