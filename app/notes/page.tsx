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
        Translation Notes
      </h1>
      
      <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555", marginBottom: "24px" }}>
          Our translations aim to preserve the original meaning and cultural context while making 
          the text accessible to English-speaking readers. We prioritize accuracy and readability.
        </p>
        
        <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#243A6E", marginTop: "32px" }}>
          Translation Philosophy
        </h2>
        <ul style={{ fontSize: "16px", lineHeight: 2, color: "#555", paddingLeft: "24px" }}>
          <li>Maintain the author's voice and style</li>
          <li>Preserve cultural nuances and context</li>
          <li>Ensure natural, readable English</li>
          <li>Respect the original work's integrity</li>
        </ul>
        
        <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#243A6E", marginTop: "32px" }}>
          Quality Assurance
        </h2>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555" }}>
          All translations undergo multiple rounds of editing and proofreading to ensure the highest quality. 
          We welcome feedback from readers to help us improve.
        </p>
      </div>
    </main>
  );
}
