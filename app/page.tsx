export default function Page() {
  return (
    <main
      style={{
        padding: "24px",
        background: "#faf9f6",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>NARRA</h1>
      <p style={{ marginBottom: "32px", color: "#666" }}>
        Web novel translation & reading platform
      </p>

      <section
        style={{
          borderTop: "1px solid #e5e5e5",
        }}
      >
        {[
          "All Novels",
          "Browse",
          "About NARRA",
          "Translation Notes",
          "Contact",
        ].map((item) => (
          <div
            key={item}
            style={{
              padding: "16px 0",
              borderBottom: "1px solid #e5e5e5",
              fontSize: "16px",
            }}
          >
            {item}
          </div>
        ))}
      </section>
    </main>
  );
}
