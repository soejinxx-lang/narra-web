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
        Support & Contact
      </h1>
      
      <div style={{ background: "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#243A6E" }}>
          Get Help
        </h2>
        <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555", marginBottom: "24px" }}>
          Need assistance? We're here to help. Whether you have questions about the platform, 
          found a bug, or want to suggest improvements, feel free to reach out.
        </p>
        
        <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "16px", color: "#243A6E", marginTop: "32px" }}>
          Common Issues
        </h2>
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#333" }}>
            Reading Issues
          </h3>
          <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555", marginBottom: "16px" }}>
            If you're experiencing problems with reading or navigation, try refreshing the page 
            or clearing your browser cache. Make sure you're using a modern browser.
          </p>
          
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "#333" }}>
            Account Issues
          </h3>
          <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555" }}>
            For account-related questions or password resets, please contact our support team 
            with your account information.
          </p>
        </div>
        
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            background: "#f8f9fa",
            borderRadius: "8px",
            borderLeft: "4px solid #243A6E",
          }}
        >
          <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#555", margin: 0 }}>
            <strong>Contact Us:</strong> For inquiries, please reach out through our official channels. 
            We typically respond within 24-48 hours.
          </p>
        </div>
      </div>
    </main>
  );
}
