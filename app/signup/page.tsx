"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sanitizeInput, isValidInput, validatePasswordStrength, validateUsername } from "@/app/utils/security";

interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 입력 sanitization
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedUsername = sanitizeInput(username.trim());
    const sanitizedPassword = password.trim();

    if (!sanitizedName || !sanitizedUsername || !sanitizedPassword) {
      setError("Please fill in all fields");
      return;
    }

    // 입력 유효성 검사
    if (!isValidInput(sanitizedName, 100) || !isValidInput(sanitizedUsername, 50) || !isValidInput(sanitizedPassword, 128)) {
      setError("Invalid input detected");
      return;
    }

    // 사용자명 검증
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.valid) {
      setError(usernameValidation.reason || "Invalid username");
      return;
    }

    if (sanitizedPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 비밀번호 강도 검증
    const passwordValidation = validatePasswordStrength(sanitizedPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.reason || "Invalid password");
      return;
    }

    // 사용자 데이터 불러오기
    const usersData = localStorage.getItem("users");
    const users: User[] = usersData ? JSON.parse(usersData) : [];

    // 중복 아이디 확인
    if (users.some((u) => u.username === sanitizedUsername)) {
      setError("ID already exists");
      return;
    }

    // 새 사용자 생성
    const newUser: User = {
      id: Date.now().toString(),
      username: sanitizedUsername,
      password: sanitizedPassword,
      name: sanitizedName,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // 자동 로그인
    localStorage.setItem("currentUser", JSON.stringify({
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
    }));

    // 헤더 업데이트를 위한 이벤트 발생
    window.dispatchEvent(new Event("storage"));

    router.push("/daily-checkin");
  };

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
        Sign Up
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
        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 500,
                color: "#243A6E",
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
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

          <div style={{ marginBottom: "20px" }}>
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

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 500,
                color: "#243A6E",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
            Sign Up
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <span style={{ color: "#666", fontSize: "14px" }}>
            Already have an account?{" "}
          </span>
          <Link
            href="/login"
            style={{
              color: "#243A6E",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}

