"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import { useLocale } from "../../lib/i18n";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string; name?: string; role?: string } | null>(null);
  const router = useRouter();
  const { t } = useLocale();

  const checkLoginStatus = () => {
    const loggedInUser = localStorage.getItem("loggedInUser") || localStorage.getItem("currentUser");
    if (loggedInUser) {
      try {
        setUser(JSON.parse(loggedInUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // 초기 로그인 상태 확인
    checkLoginStatus();

    // storage 이벤트 리스너 추가 (다른 탭에서 로그인/로그아웃 시 감지)
    const handleStorageChange = (e: StorageEvent | Event) => {
      // StorageEvent인 경우 key 체크
      if (e instanceof StorageEvent) {
        if (e.key === "currentUser" || e.key === "loggedInUser") {
          checkLoginStatus();
        }
      } else {
        // 커스텀 이벤트인 경우 무조건 체크
        checkLoginStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // 페이지 포커스 시 상태 확인
    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("currentUser");
    setUser(null);
    // 상태 업데이트를 위해 약간의 지연 후 리다이렉트
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 100);
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        borderBottom: "1px solid #e5e5e5",
        background: "#faf8f3",
      }}
    >
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="narra-logo"
          style={{
            textDecoration: "none",
          }}
        >
          NARRA
        </Link>
        <SearchBar />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#243A6E", fontWeight: 500 }}>
                {user.name || user.username}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: "6px 12px",
                  background: "#243A6E",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1e2f56";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#243A6E";
                }}
              >
                {t("header.logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                padding: "6px 12px",
                background: "#243A6E",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "0",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              {t("header.login")}
            </Link>
          )}
          <div
            onMouseEnter={() => setOpen(true)}
            style={{
              fontSize: 20,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
            }}
          >
            ☰
          </div>
        </div>
      </div>

      {open && (
        <nav
          onMouseLeave={closeMenu}
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            width: "100%",
            background: "#faf8f3",
            borderTop: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5",
            zIndex: 10,
          }}
        >
          {[
            { href: "/novels", labelKey: "header.allNovels" },
            { href: "/browse", labelKey: "header.browse" },
            { href: "/dashboard", labelKey: "header.myPage", requireLogin: true, requireRole: "author" },
            { href: "/library", labelKey: "header.library", requireLogin: true },
            { href: "/guide", labelKey: "header.guide" },
            { href: "/notes", labelKey: "header.notes" },
            { href: "/settings", labelKey: "header.settings" },
          ].filter((item) => {
            if (item.requireLogin && !user) return false;
            if (item.requireRole && user?.role !== item.requireRole && user?.role !== 'admin') return false;
            return true;
          }).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              style={{
                display: "block",
                padding: "16px",
                borderBottom: "1px solid #e5e5e5",
                textDecoration: "none",
                color: "black",
              }}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
