"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sanitizeInput, isValidInput, checkLoginAttempts, recordLoginAttempt } from "@/app/utils/security";
import { secureSetItem } from "@/app/utils/localStorageSecurity";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 이미 로그인되어 있는지 확인
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
      router.push("/daily-checkin");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 입력 검증 및 Rate Limiting
    const sanitizedUsername = sanitizeInput(username.trim());
    if (!sanitizedUsername || !password) {
      setError("Please enter both ID and password");
      return;
    }

    if (!isValidInput(sanitizedUsername, 20)) {
      setError("Invalid username format");
      return;
    }

    // Rate limiting 체크
    const rateLimitCheck = checkLoginAttempts(sanitizedUsername);
    if (!rateLimitCheck.allowed) {
      const minutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000);
      setError(`Too many login attempts. Please try again in ${minutes} minutes.`);
      return;
    }

    setLoading(true);

    try {
      const storageBase = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace('/api', '');
      if (!storageBase || typeof storageBase !== "string" || !storageBase.startsWith("http")) {
        setError("Invalid server configuration");
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${storageBase}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: sanitizedUsername,
          password, // 비밀번호는 서버에서 검증
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 실패한 로그인 시도 기록
        recordLoginAttempt(sanitizedUsername, false);
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // 성공한 로그인 시도 기록 (Rate limiting 리셋)
      recordLoginAttempt(sanitizedUsername, true);

      // 토큰과 사용자 정보 안전하게 저장
      if (data.token && data.user) {
        secureSetItem("authToken", data.token);
        secureSetItem("currentUser", data.user);
      }

      // 헤더 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new Event("storage"));

      router.push("/daily-checkin");
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return null;
  }

  return (
    <main style={{ padding: "32px 24px", maxWidth: "500px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "32px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
          textAlign: "center",
        }}
      >
        Login
      </h1>

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "32px",
          border: "1px solid #e5e5e5",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 500,
                color: "#243A6E",
              }}
            >
              ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                const value = e.target.value;
                // 실시간 입력 제한 (최대 20자)
                if (value.length <= 20) {
                  setUsername(value);
                }
              }}
              placeholder="Enter your ID"
              required
              disabled={loading}
              maxLength={20}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 500,
                color: "#243A6E",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                // 실시간 입력 제한 (최대 128자)
                if (value.length <= 128) {
                  setPassword(value);
                }
              }}
              placeholder="Enter your password"
              required
              disabled={loading}
              maxLength={128}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                background: "#fee",
                color: "#c33",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#9ca3af" : "#243A6E",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#1e2f56";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "#243A6E";
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <span style={{ color: "#666", fontSize: "14px" }}>
            Don't have an account?{" "}
          </span>
          <Link
            href="/signup"
            style={{
              color: "#243A6E",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
