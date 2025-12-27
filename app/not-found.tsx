export default function NotFound() {
  return (
    <main
      style={{
        padding: 48,
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          marginBottom: 12,
        }}
      >
        Page Not Found
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: 24,
        }}
      >
        This content does not exist or may have been removed.
      </p>

      <a
        href="/novels"
        style={{
          fontWeight: 600,
          color: "#111",
          textDecoration: "none",
        }}
      >
        Back to all novels
      </a>
    </main>
  );
}
