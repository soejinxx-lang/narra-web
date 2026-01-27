"use client";

import { useState, useEffect } from "react";

type LanguageLearningModeProps = {
  novelId: string;
  episode: number;
  availableLanguages: string[];
  defaultSourceLang?: string;
  defaultTargetLang?: string;
  settings: {
    fontSize: number;
    lineHeight: number;
    backgroundColor: string;
    fontFamily: string;
  };
};

type DisplayMode = "side-by-side" | "interleaved";

export default function LanguageLearningMode({
  novelId,
  episode,
  availableLanguages,
  defaultSourceLang = "ko",
  defaultTargetLang = "en",
  settings,
}: LanguageLearningModeProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [sourceLang, setSourceLang] = useState(defaultSourceLang);
  const [targetLang, setTargetLang] = useState(defaultTargetLang);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("side-by-side");
  const [isMobile, setIsMobile] = useState(false);

  // 번역 데이터
  const [sourceContent, setSourceContent] = useState<string[]>([]);
  const [targetContent, setTargetContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // 모바일이면 자동으로 interleaved 모드
      if (window.innerWidth < 768) {
        setDisplayMode("interleaved");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 저장된 설정 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("languageLearningMode");
    if (saved) {
      try {
        const { enabled, source, target, mode } = JSON.parse(saved);
        setIsEnabled(enabled || false);
        setSourceLang(source || defaultSourceLang);
        setTargetLang(target || defaultTargetLang);
        if (!isMobile) {
          setDisplayMode(mode || "side-by-side");
        }
      } catch (e) {
        // 기본값 사용
      }
    }
  }, [defaultSourceLang, defaultTargetLang, isMobile]);

  // 설정 저장
  useEffect(() => {
    localStorage.setItem(
      "languageLearningMode",
      JSON.stringify({
        enabled: isEnabled,
        source: sourceLang,
        target: targetLang,
        mode: displayMode,
      })
    );
  }, [isEnabled, sourceLang, targetLang, displayMode]);

  // 번역 데이터 로드
  useEffect(() => {
    if (!isEnabled) return;

    const loadTranslations = async () => {
      setLoading(true);

      try {
        // 소스 언어 로드
        const sourceRes = await fetch(
          `/api/novels/${novelId}/episodes/${episode}?lang=${sourceLang}`,
          { cache: "no-store" }
        );
        const sourceData = await sourceRes.json();

        // 타겟 언어 로드
        const targetRes = await fetch(
          `/api/novels/${novelId}/episodes/${episode}?lang=${targetLang}`,
          { cache: "no-store" }
        );
        const targetData = await targetRes.json();

        // 문장 단위로 분리 (간단한 구현)
        const sourceSentences = splitIntoSentences(sourceData.content || "");
        const targetSentences = splitIntoSentences(targetData.content || "");

        setSourceContent(sourceSentences);
        setTargetContent(targetSentences);
      } catch (error) {
        console.error("Failed to load translations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [isEnabled, sourceLang, targetLang, novelId, episode]);

  // 문장 분리 함수 (간단한 버전)
  const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];

    // 단락 단위로 먼저 분리
    const paragraphs = text.split("\n\n").filter((p) => p.trim());

    const sentences: string[] = [];

    for (const para of paragraphs) {
      // 문장 부호로 분리
      const paraItems = para.split(/([.!?。！？]+\s+|\n)/g);
      let currentSentence = "";

      for (const item of paraItems) {
        if (/[.!?。！？]+\s+|\n/.test(item)) {
          if (currentSentence.trim()) {
            sentences.push(currentSentence.trim() + item.trim());
            currentSentence = "";
          }
        } else {
          currentSentence += item;
        }
      }

      if (currentSentence.trim()) {
        sentences.push(currentSentence.trim());
      }

      // 단락 구분을 위한 빈 줄
      sentences.push("");
    }

    return sentences.filter((s) => s !== "" || sentences.indexOf(s) > 0);
  };

  const getLanguageName = (code: string): string => {
    const names: Record<string, string> = {
      ko: "Korean",
      en: "English",
      ja: "Japanese",
      zh: "Chinese",
      es: "Spanish",
      fr: "French",
      de: "German",
      pt: "Portuguese",
      id: "Indonesian",
    };
    return names[code] || code.toUpperCase();
  };

  const isDark = settings.backgroundColor === "#1a1a1a";

  if (!isEnabled) {
    return (
      <div
        style={{
          padding: "24px",
          background: isDark ? "#2a2a2a" : "#f8f9fa",
          borderRadius: "12px",
          border: `1px solid ${isDark ? "#444" : "#e5e5e5"}`,
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "24px" }}>📚</span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: isDark ? "#fff" : "#243A6E",
                }}
              >
                Language Learning Mode
              </h3>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: isDark ? "#ccc" : "#666",
                lineHeight: 1.6,
              }}
            >
              Read in two languages side-by-side and improve your language skills
              while enjoying web novels!
            </p>
          </div>

          <button
            onClick={() => setIsEnabled(true)}
            style={{
              padding: "12px 32px",
              background: "linear-gradient(135deg, #243A6E 0%, #3b5998 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(36, 58, 110, 0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(36, 58, 110, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(36, 58, 110, 0.3)";
            }}
          >
            Enable Study Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "32px" }}>
      {/* 컨트롤 패널 */}
      <div
        style={{
          padding: "20px",
          background: isDark ? "#2a2a2a" : "#f8f9fa",
          borderRadius: "12px",
          border: `1px solid ${isDark ? "#444" : "#e5e5e5"}`,
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>📚</span>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 600,
                color: isDark ? "#fff" : "#243A6E",
              }}
            >
              Study Mode
            </h3>
            <span
              style={{
                padding: "4px 12px",
                background: "#10b981",
                color: "#fff",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              ON
            </span>
          </div>

          <button
            onClick={() => setIsEnabled(false)}
            style={{
              padding: "8px 20px",
              background: isDark ? "#444" : "#fff",
              color: isDark ? "#fff" : "#333",
              border: `1px solid ${isDark ? "#555" : "#e5e5e5"}`,
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Disable
          </button>
        </div>

        {/* 언어 선택 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "#555" : "#e5e5e5"}`,
              background: isDark ? "#333" : "#fff",
              color: isDark ? "#fff" : "#333",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {getLanguageName(lang)}
              </option>
            ))}
          </select>

          <div
            style={{
              fontSize: "20px",
              color: isDark ? "#888" : "#999",
            }}
          >
            ⇄
          </div>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${isDark ? "#555" : "#e5e5e5"}`,
              background: isDark ? "#333" : "#fff",
              color: isDark ? "#fff" : "#333",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {getLanguageName(lang)}
              </option>
            ))}
          </select>

          {/* 데스크톱에서만 모드 전환 */}
          {!isMobile && (
            <div
              style={{
                display: "flex",
                background: isDark ? "#333" : "#e5e5e5",
                borderRadius: "8px",
                padding: "4px",
              }}
            >
              <button
                onClick={() => setDisplayMode("side-by-side")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background:
                    displayMode === "side-by-side"
                      ? isDark
                        ? "#243A6E"
                        : "#243A6E"
                      : "transparent",
                  color:
                    displayMode === "side-by-side"
                      ? "#fff"
                      : isDark
                        ? "#ccc"
                        : "#666",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title="Side by side"
              >
                ▭▭
              </button>
              <button
                onClick={() => setDisplayMode("interleaved")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background:
                    displayMode === "interleaved"
                      ? isDark
                        ? "#243A6E"
                        : "#243A6E"
                      : "transparent",
                  color:
                    displayMode === "interleaved"
                      ? "#fff"
                      : isDark
                        ? "#ccc"
                        : "#666",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title="Interleaved"
              >
                ☰
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 콘텐츠 표시 */}
      {loading ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: isDark ? "#888" : "#999",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "16px",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            📚
          </div>
          <p style={{ fontSize: "16px", margin: 0 }}>Loading translations...</p>
        </div>
      ) : displayMode === "side-by-side" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* 왼쪽: 소스 언어 */}
          <div
            style={{
              padding: "24px",
              background: isDark ? "#1e1e1e" : "#fff",
              borderRadius: "12px",
              border: `2px solid ${isDark ? "#444" : "#e5e5e5"}`,
            }}
          >
            <div
              style={{
                fontSize: settings.fontSize,
                lineHeight: settings.lineHeight,
                fontFamily: settings.fontFamily,
                color: isDark ? "#e0e0e0" : "#333",
                whiteSpace: "pre-wrap",
              }}
            >
              {sourceContent.map((sentence, i) => (
                <p key={i} style={{ marginBottom: sentence === "" ? "24px" : "12px" }}>
                  {sentence}
                </p>
              ))}
            </div>
          </div>

          {/* 오른쪽: 타겟 언어 */}
          <div
            style={{
              padding: "24px",
              background: isDark ? "#1e1e1e" : "#fff",
              borderRadius: "12px",
              border: `2px solid ${isDark ? "#444" : "#e5e5e5"}`,
            }}
          >
            <div
              style={{
                fontSize: settings.fontSize,
                lineHeight: settings.lineHeight,
                fontFamily: settings.fontFamily,
                color: isDark ? "#e0e0e0" : "#333",
                whiteSpace: "pre-wrap",
              }}
            >
              {targetContent.map((sentence, i) => (
                <p key={i} style={{ marginBottom: sentence === "" ? "24px" : "12px" }}>
                  {sentence}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Interleaved 모드 */
        <div
          style={{
            padding: "24px",
            background: isDark ? "#1e1e1e" : "#fff",
            borderRadius: "12px",
            border: `2px solid ${isDark ? "#444" : "#e5e5e5"}`,
          }}
        >
          <div
            style={{
              fontSize: settings.fontSize,
              lineHeight: settings.lineHeight,
              fontFamily: settings.fontFamily,
            }}
          >
            {sourceContent.map((sourceSentence, i) => {
              const targetSentence = targetContent[i] || "";

              if (sourceSentence === "" && targetSentence === "") {
                return <div key={i} style={{ height: "24px" }} />;
              }

              return (
                <div key={i} style={{ marginBottom: "20px" }}>
                  <p
                    style={{
                      margin: 0,
                      marginBottom: "8px",
                      color: isDark ? "#fff" : "#243A6E",
                      fontWeight: 600,
                    }}
                  >
                    {sourceSentence}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: isDark ? "#aaa" : "#666",
                      fontStyle: "italic",
                    }}
                  >
                    {targetSentence}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
