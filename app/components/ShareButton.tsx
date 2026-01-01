"use client";

import { useState } from "react";

type ShareButtonProps = {
  novelId: string;
  novelTitle: string;
};

export default function ShareButton({ novelId, novelTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/novels/${novelId}`
    : "";

  const handleShare = async () => {
    const fullUrl = shareUrl;
    
    // Track share for daily missions
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().split("T")[0];
      const shareKey = `novelShares_${today}`;
      const currentShares = parseInt(localStorage.getItem(shareKey) || "0", 10);
      localStorage.setItem(shareKey, String(currentShares + 1));
    }
    
    // Try using Web Share API if available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: novelTitle,
          text: `Check out this novel: ${novelTitle}`,
          url: fullUrl,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to clipboard
      }
    }

    // Fall back to clipboard copy
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert("Failed to copy link. Please copy it manually: " + fullUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        background: copied ? "#4CAF50" : "#243A6E",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.background = "#1e2f56";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.background = "#243A6E";
        }
      }}
    >
      {copied ? "✓ Link Copied!" : "🔗 Share"}
    </button>
  );
}

