"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sanitizeInput, isValidInput, validateUsername, validatePasswordStrength } from "@/app/utils/security";
import { secureSetItem } from "@/app/utils/localStorageSecurity";
import { useLocale } from "../../lib/i18n";

export default function SignUpPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isKorean = locale === "ko";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 입력 sanitization
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedUsername = sanitizeInput(username.trim());

    if (!sanitizedName || !sanitizedUsername || !password) {
      setError("Please fill in all fields");
      return;
    }

    // 입력 검증
    if (!isValidInput(sanitizedName, 100) || !isValidInput(sanitizedUsername, 20)) {
      setError("Invalid input detected");
      return;
    }

    // 사용자명 검증
    const usernameValidation = validateUsername(sanitizedUsername);
    if (!usernameValidation.valid) {
      setError(usernameValidation.reason || "Invalid username");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 비밀번호 강도 검증
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.reason || "Password is too weak");
      return;
    }

    // ✅ 약관 동의 검증
    if (!agreedToTerms || !agreedToPrivacy) {
      setError(isKorean ? "필수 약관에 동의해주세요" : "Please agree to the required terms");
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

      const response = await fetch(`${storageBase}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: sanitizedUsername,
          password,
          name: sanitizedName,
          agreedToTerms: true,
        }),
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      // 토큰과 사용자 정보 안전하게 저장
      if (data.token && data.user) {
        secureSetItem("authToken", data.token);
        secureSetItem("currentUser", data.user);
      }

      // 헤더 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new Event("storage"));

      router.push("/daily-checkin");
    } catch (error) {
      console.error("Signup error:", error);
      setError("Network error. Please try again.");
      setLoading(false);
    }
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
        {t("login.signupTitle")}
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
              {t("login.name")}
            </label>
            <input
              data-testid="signup.name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              disabled={loading}
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
              {t("login.username")}
            </label>
            <input
              data-testid="signup.username"
              type="text"
              onChange={(e) => {
                const value = e.target.value;
                const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, "");
                if (sanitized.length <= 20) {
                  setUsername(sanitized);
                }
              }}
              placeholder="3-20 characters (letters, numbers, _ and - only)"
              required
              disabled={loading}
              maxLength={20}
              pattern="[a-zA-Z0-9_\-]+"
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
              {t("login.password")}
            </label>
            <div style={{ position: "relative" }}>
              <input
                data-testid="signup.password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 128) {
                    setPassword(value);
                  }
                }}
                placeholder="8+ characters (must include letters and numbers)"
                required
                disabled={loading}
                maxLength={128}
                minLength={8}
                style={{
                  width: "100%",
                  padding: "12px",
                  paddingRight: "45px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  color: "#666",
                }}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
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
              {t("login.confirmPassword")}
            </label>
            <div style={{ position: "relative" }}>
              <input
                data-testid="signup.confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 128) {
                    setConfirmPassword(value);
                  }
                }}
                placeholder="Confirm your password"
                required
                disabled={loading}
                maxLength={128}
                minLength={8}
                style={{
                  width: "100%",
                  padding: "12px",
                  paddingRight: "45px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "18px",
                  color: "#666",
                }}
              >
                {showConfirmPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>

          {/* ✅ 약관 동의 체크박스 (분리형) */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#333",
                marginBottom: "10px",
              }}
            >
              <input
                data-testid="signup.terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={loading}
                style={{ marginTop: "3px", accentColor: "#243A6E" }}
              />
              <span>
                <span style={{ color: "#c33", fontWeight: 600, fontSize: "12px" }}>[{isKorean ? "필수" : "Required"}]</span>{" "}
                {isKorean ? "이용약관에 동의합니다" : "I agree to the Terms of Service"}{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#243A6E", textDecoration: "underline", fontSize: "13px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isKorean ? "(보기)" : "(View)"}
                </a>
              </span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#333",
              }}
            >
              <input
                data-testid="signup.privacy"
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                disabled={loading}
                style={{ marginTop: "3px", accentColor: "#243A6E" }}
              />
              <span>
                <span style={{ color: "#c33", fontWeight: 600, fontSize: "12px" }}>[{isKorean ? "필수" : "Required"}]</span>{" "}
                {isKorean ? "개인정보처리방침에 동의합니다" : "I agree to the Privacy Policy"}{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#243A6E", textDecoration: "underline", fontSize: "13px" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isKorean ? "(보기)" : "(View)"}
                </a>
              </span>
            </label>
          </div>

          {error && (
            <div
              data-testid="signup.error"
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
            data-testid="signup.submit"
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
            {loading ? t("login.signingUp") : t("login.signupSubmit")}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {t("login.haveAccount")}{" "}
          </span>
          <Link
            href="/login"
            style={{
              color: "#243A6E",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            {t("login.title")}
          </Link>
        </div>
      </div>
    </main>
  );
}
