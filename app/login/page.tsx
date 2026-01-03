"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkLoginAttempts, recordLoginFailure, clearLoginAttempts, sanitizeInput, isValidInput } from "@/app/utils/security";

interface User {
  id: string;
  username: string;
  password: string;
  name?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 이미 로그인되어 있는지 확인
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      setIsLoggedIn(true);
      router.push("/daily-checkin");
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 입력 검증 및 sanitization
    const sanitizedUsername = sanitizeInput(username.trim());
    const sanitizedPassword = password.trim();

    if (!sanitizedUsername || !sanitizedPassword) {
      setError("Please enter both ID and password");
      return;
    }

    // 입력 유효성 검사
    if (!isValidInput(sanitizedUsername, 50) || !isValidInput(sanitizedPassword, 128)) {
      setError("Invalid input detected");
      return;
    }

    // 로그인 시도 제한 확인
    const attemptCheck = checkLoginAttempts(sanitizedUsername);
    if (!attemptCheck.allowed) {
      setError(`Too many login attempts. Please try again in ${attemptCheck.remainingTime} seconds.`);
      return;
    }

    // 사용자 데이터 불러오기
    const usersData = localStorage.getItem("users");
    if (!usersData) {
      setError("No account found. Please sign up first.");
      return;
    }

    try {
      const users: User[] = JSON.parse(usersData);
      const user = users.find(
        (u) => u.username === sanitizedUsername && u.password === sanitizedPassword
      );

      if (!user) {
        recordLoginFailure(sanitizedUsername);
        setError("Invalid ID or password");
        return;
      }

      // 로그인 성공
      clearLoginAttempts(sanitizedUsername);
      localStorage.setItem("currentUser", JSON.stringify({
        id: user.id,
        username: user.username,
        name: user.name,
      }));

      // 헤더 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new Event("storage"));

      router.push("/daily-checkin");
    } catch (error) {
      setError("An error occurred. Please try again.");
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
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your ID"
              required
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
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
            style={{
              width: "100%",
              padding: "12px",
              background: "#243A6E",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1e2f56";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#243A6E";
            }}
          >
            Login
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

