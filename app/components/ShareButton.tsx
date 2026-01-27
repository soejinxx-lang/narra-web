"use client";

import { useState } from "react";

type ShareButtonProps = {
  novelId: string;
  novelTitle: string;
};

export default function ShareButton({ novelId, novelTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState<string | null>(null); // 'min', 'pill', 'float'

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/novels/${novelId}`
    : "";

  const handleShare = async (id: string) => {
    const fullUrl = shareUrl;

    // Track share logic (Existing)
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          const userId = user.id;
          const usEasternDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
          const today = `${usEasternDate.getFullYear()}-${String(usEasternDate.getMonth() + 1).padStart(2, "0")}-${String(usEasternDate.getDate()).padStart(2, "0")}`;
          const shareKey = `novelShares_${userId}_${today}`;
          const currentShares = parseInt(localStorage.getItem(shareKey) || "0", 10);
          localStorage.setItem(shareKey, String(currentShares + 1));
        } catch (e) {
          console.error("Failed to track share:", e);
        }
      }
    }

    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: novelTitle,
          text: `Check out this novel: ${novelTitle}`,
          url: fullUrl,
        });
        return;
      } catch (error) {
        // Fallback
      }
    }

    // Clipboard API
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      } catch (err) {
        alert("Failed to copy link. Please copy it manually: " + fullUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {/* Option 1: Minimalist (Square) */}
      <button
        onClick={() => handleShare('min')}
        title="Option 1: Minimalist"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          background: "#fff",
          color: copied === 'min' ? "#10B981" : "#374151",
          border: `1px solid ${copied === 'min' ? "#10B981" : "#E5E7EB"}`,
          borderRadius: "8px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { if (copied !== 'min') e.currentTarget.style.background = "#F9FAFB"; }}
        onMouseLeave={(e) => { if (copied !== 'min') e.currentTarget.style.background = "#fff"; }}
      >
        {copied === 'min' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        )}
      </button>

      {/* Option 2: Pill (Modern) */}
      <button
        onClick={() => handleShare('pill')}
        title="Option 2: Pill"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          background: copied === 'pill' ? "#DCFCE7" : "#E3F2FD",
          color: copied === 'pill' ? "#166534" : "#1E88E5",
          border: "none",
          borderRadius: "100px", // Pill shape
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { if (copied !== 'pill') e.currentTarget.style.background = "#BBDEFB"; }}
        onMouseLeave={(e) => { if (copied !== 'pill') e.currentTarget.style.background = "#E3F2FD"; }}
      >
        {copied === 'pill' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Copied</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>Share</span>
          </>
        )}
      </button>

      {/* Option 3: Floating (Shadow) */}
      <button
        onClick={() => handleShare('float')}
        title="Option 3: Floating"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          background: copied === 'float' ? "#10B981" : "#fff",
          color: copied === 'float' ? "#fff" : "#1E293B",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
        onMouseEnter={(e) => { if (copied !== 'float') { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 8px -1px rgba(0, 0, 0, 0.1)"; } }}
        onMouseLeave={(e) => { if (copied !== 'float') { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"; } }}
      >
        {copied === 'float' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        )}
      </button>
    </div>
  );
}

