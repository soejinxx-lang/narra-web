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
    
    // Track share for daily missions (로그인한 사용자만)
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          const userId = user.id;
          // 미국 동부 시간 기준 오늘 날짜
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
        gap: "0",
        padding: "10px 12px",
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
      {copied ? "✓" : "🔗"}
    </button>
  );
}

