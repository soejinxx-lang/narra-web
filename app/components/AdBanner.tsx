"use client";

/**
 * AdBanner — Google AdSense placeholder
 * 
 * This component renders a styled ad slot placeholder.
 * Once AdSense is approved, replace the placeholder with actual ad code:
 *   <ins class="adsbygoogle" data-ad-client="ca-pub-XXXX" data-ad-slot="XXXX" />
 *   <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
 */
export default function AdBanner({ slot = "bottom" }: { slot?: "bottom" | "sidebar" }) {
    return (
        <div
            style={{
                margin: slot === "bottom" ? "32px 0" : "0",
                padding: "20px",
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                borderRadius: "12px",
                border: "1px dashed #dee2e6",
                textAlign: "center",
                color: "#adb5bd",
                fontSize: "12px",
                minHeight: slot === "bottom" ? "90px" : "250px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "4px",
            }}
        >
            <span style={{ fontSize: "16px", opacity: 0.5 }}>📢</span>
            <span>Advertisement</span>
            {/* 
              TODO: Replace with actual AdSense code after approval
              <ins className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-XXXXXXXXXX"
                data-ad-slot="XXXXXXXXXX"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            */}
        </div>
    );
}
