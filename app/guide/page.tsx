export default function Page() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
      <h1
        style={{
          fontSize: "36px",
          fontWeight: 600,
          marginBottom: "32px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        About NARRA
      </h1>
      
      <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555", marginBottom: "24px" }}>
          NARRA is a web novel translation and reading platform that combines systematic curation with editorial judgment. 
          We bring together the best translated web novels from around the world.
        </p>
        
        <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#243A6E", marginTop: "32px" }}>
          Our Mission
        </h2>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555" }}>
          To create a platform where readers can discover high-quality translated web novels, 
          and where the best stories from different cultures can find a global audience.
        </p>
      </div>
    </main>
  );
}
