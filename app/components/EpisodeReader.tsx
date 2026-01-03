"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReadingSettings, { ReadingSettings as ReadingSettingsType } from "./ReadingSettings";
import ShareButton from "./ShareButton";

type EpisodeReaderProps = {
  episode: any;
  novel: any;
  novelId: string;
  prevEpisode: any;
  nextEpisode: any;
};

type ViewMode = "single" | "dual";
type Language = string; // 언어 코드 (예: "ko", "en", "ja" 등)

export default function EpisodeReader({
  episode,
  novel,
  novelId,
  prevEpisode,
  nextEpisode,
}: EpisodeReaderProps) {
  const [settings, setSettings] = useState<ReadingSettingsType>({
    fontSize: 16,
    lineHeight: 1.8,
    backgroundColor: "#faf9f6",
    fontFamily: "inherit",
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  // 기본 8개 언어로 초기화
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(["ko", "en", "ja", "zh", "es", "fr", "de", "pt"]);
  const [leftLanguage, setLeftLanguage] = useState<Language>("ko");
  const [rightLanguage, setRightLanguage] = useState<Language>("en");
  // 번역 데이터 캐시 (클라이언트 사이드에서 로드)
  const [translations, setTranslations] = useState<Record<string, any>>({
    ko: episode, // 기본 한국어는 서버에서 가져온 데이터
  });

  useEffect(() => {
    // 로컬 스토리지에서 설정 불러오기
    const saved = localStorage.getItem("readingSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (e) {
        // 기본값 사용
      }
    }
    
    // 듀얼 모드 설정 불러오기
    const savedViewMode = localStorage.getItem("dualViewMode");
    if (savedViewMode === "dual") {
      setViewMode("dual");
    }
    
    // localStorage에서 언어 목록 불러오기
    if (typeof window !== "undefined") {
      // 여러 가능한 키 이름 확인
      const languageKeys = [
        "languages",
        "availableLanguages",
        "supportedLanguages",
        "translationLanguages",
        "dualLanguages",
      ];
      
      let languages: Language[] = [];
      for (const key of languageKeys) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              languages = parsed;
              break;
            }
          } catch (e) {
            // 파싱 실패 시 다음 키 시도
          }
        }
      }
      
      // 언어 목록이 없으면 기본값 사용 (8개 언어)
      if (languages.length === 0) {
        languages = ["ko", "en", "ja", "zh", "es", "fr", "de", "pt"];
        // 기본값을 localStorage에 저장
        localStorage.setItem("availableLanguages", JSON.stringify(languages));
      }
      
      setAvailableLanguages(languages);
      
      // 기본 언어 설정 (첫 번째와 두 번째 언어)
      if (languages.length >= 2) {
        setLeftLanguage(languages[0]);
        setRightLanguage(languages[1]);
      } else if (languages.length >= 1) {
        setLeftLanguage(languages[0]);
        setRightLanguage(languages[0]);
      }
    }

    // Track episode read for daily missions
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) return; // 로그인하지 않은 경우 카운트하지 않음
      
      try {
        const user = JSON.parse(currentUser);
        const userId = user.id;
        // 미국 동부 시간 기준 오늘 날짜
        const usEasternDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
        const today = `${usEasternDate.getFullYear()}-${String(usEasternDate.getMonth() + 1).padStart(2, "0")}-${String(usEasternDate.getDate()).padStart(2, "0")}`;
        const readKey = `episodesRead_${userId}_${today}`;
        
        // Check if this episode was already read today
        const readEpisodesKey = `readEpisodes_${userId}_${today}`;
        const readEpisodes = JSON.parse(localStorage.getItem(readEpisodesKey) || "[]");
        const episodeId = `${novelId}_${episode.ep}`;
        
        if (!readEpisodes.includes(episodeId)) {
          readEpisodes.push(episodeId);
          localStorage.setItem(readEpisodesKey, JSON.stringify(readEpisodes));
          const currentReads = parseInt(localStorage.getItem(readKey) || "0", 10);
          localStorage.setItem(readKey, String(currentReads + 1));
        }
      } catch (e) {
        console.error("Failed to track episode read:", e);
      }
    }
  }, [novelId, episode]);

  const handleSettingsChange = (newSettings: ReadingSettingsType) => {
    setSettings(newSettings);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("dualViewMode", mode);
  };


  // 언어 코드를 풀네임으로 변환
  const getLanguageName = (lang: Language): string => {
    const languageNames: Record<string, string> = {
      ko: "Korean",
      en: "English",
      ja: "Japanese",
      zh: "Chinese",
      es: "Spanish",
      fr: "French",
      de: "German",
      pt: "Portuguese",
    };
    return languageNames[lang] || lang.toUpperCase();
  };

  // 언어별 콘텐츠 로드 (클라이언트 사이드)
  useEffect(() => {
    const loadTranslation = async (lang: Language) => {
      // 이미 로드된 언어면 스킵
      if (translations[lang]) {
        return;
      }

      try {
        // API route를 통해 호출
        const res = await fetch(
          `/api/novels/${encodeURIComponent(novelId)}/episodes/${encodeURIComponent(episode.ep)}?lang=${lang}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const data = await res.json();
          
          // 응답의 language 필드가 요청한 언어와 일치하는지 확인
          if (data.language && data.language !== lang) {
            console.warn(
              `[${lang}] Language mismatch: requested ${lang}, received ${data.language}`
            );
            // 언어가 일치하지 않으면 번역이 준비되지 않은 것으로 처리
            setTranslations((prev) => ({
              ...prev,
              [lang]: { ...data, translationNotReady: true },
            }));
            return;
          }
          
          // 잘못된 응답 체크 (챗봇 응답 등)
          const chatbotPatterns = [
            "Hello. How can I assist you today?",
            "Hello! How can I assist you today?",
            "How can I assist you",
            "I'm here to help",
          ];
          
          const isChatbotResponse = chatbotPatterns.some(
            (pattern) => data.content && data.content.includes(pattern)
          );
          
          if (isChatbotResponse) {
            console.warn(`[${lang}] Translation not ready - received chatbot response`);
            // 번역이 준비되지 않았다는 것을 표시하기 위해 빈 객체 저장
            setTranslations((prev) => ({
              ...prev,
              [lang]: { ...data, content: "", translationNotReady: true },
            }));
            return;
          }
          
          // 응답이 객체이고 content 필드가 있는지 확인
          if (!data || typeof data !== "object") {
            console.error(`[${lang}] Invalid response format:`, data);
            return;
          }
          
          // content 필드가 없거나 너무 짧으면 번역이 아직 준비되지 않은 것
          if (!data.content || data.content.trim().length < 10) {
            console.warn(`[${lang}] Translation not available (status: ${data.status || "unknown"})`);
            setTranslations((prev) => ({
              ...prev,
              [lang]: { ...data, translationNotReady: true },
            }));
            return;
          }
          
          // status가 PENDING이면 번역이 아직 준비되지 않음
          if (data.status === "PENDING") {
            console.warn(`[${lang}] Translation status is PENDING`);
            setTranslations((prev) => ({
              ...prev,
              [lang]: { ...data, translationNotReady: true },
            }));
            return;
          }
          
          setTranslations((prev) => ({
            ...prev,
            [lang]: data,
          }));
        } else {
          console.error(`[${lang}] Failed to fetch translation: ${res.status} ${res.statusText}`);
        }
      } catch (error) {
        console.error(`[${lang}] Failed to load translation:`, error);
      }
    };

    // 듀얼 모드일 때 양쪽 언어 모두 로드
    if (viewMode === "dual") {
      loadTranslation(leftLanguage);
      loadTranslation(rightLanguage);
    }
  }, [viewMode, leftLanguage, rightLanguage, novelId, episode.ep, translations]);

  // 언어별 콘텐츠 가져오기
  const getContent = (lang: Language) => {
    const translation = translations[lang];
    
    // 번역이 준비되지 않은 경우
    if (translation && translation.translationNotReady) {
      return `[Translation pending...]`;
    }
    
    if (translation && translation.content) {
      // 챗봇 응답 체크
      const chatbotPatterns = [
        "Hello. How can I assist you today?",
        "Hello! How can I assist you today?",
      ];
      
      const isChatbotResponse = chatbotPatterns.some(
        (pattern) => translation.content.includes(pattern)
      );
      
      if (isChatbotResponse) {
        return `[Translation pending...]`;
      }
      
      return translation.content;
    }
    
    // 한국어는 기본 episode 사용
    if (lang === "ko") {
      return episode.content || "";
    }
    
    // 다른 언어는 로딩 중이거나 없을 수 있음
    return `[Loading translation...]`;
  };

  // 언어별 제목 가져오기
  const getTitle = (lang: Language) => {
    const translation = translations[lang];
    if (translation && translation.title) {
      return translation.title;
    }
    
    // 한국어는 기본 episode 사용
    if (lang === "ko") {
      return episode.title || "";
    }
    
    // 다른 언어는 로딩 중이거나 없을 수 있음
    return translation?.title || episode.title || "";
  };

  const navButtonStyle = {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "1px solid #e5e5e5",
    background: "#fff",
    color: "#333",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: settings.backgroundColor,
        transition: "background 0.3s",
      }}
    >
      {/* 헤더 영역 */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e5e5",
          padding: "16px 24px",
          position: "sticky",
          top: 56,
          zIndex: 50,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            width: "100%",
          }}
        >
          <Link
            href={`/novels/${novelId}`}
            style={{
              textDecoration: "none",
              color: "#243A6E",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0",
            }}
          >
            ←
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {novel && <ShareButton novelId={novelId} novelTitle={novel.title || "Novel"} />}
            <ReadingSettings onSettingsChange={handleSettingsChange} />
          </div>
        </div>
      </div>

      {/* 본문 영역 */}
      <div
        style={{
          maxWidth: viewMode === "dual" ? "100%" : "800px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        {/* 모드 전환 버튼 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ marginBottom: "32px", flex: 1 }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 600,
                marginBottom: "8px",
                color: settings.backgroundColor === "#1a1a1a" ? "#fff" : "#243A6E",
                fontFamily: '"KoPub Batang", serif',
              }}
            >
              EP {episode.ep} {episode.title ? `- ${episode.title}` : ""}
            </h1>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* 단일/듀얼 모드 전환 */}
            <div
              style={{
                display: "flex",
                background: "#f5f5f5",
                borderRadius: "8px",
                padding: "4px",
                gap: "4px",
              }}
            >
              <button
                onClick={() => handleViewModeChange("single")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background: viewMode === "single" ? "#243A6E" : "transparent",
                  color: viewMode === "single" ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                ▭
              </button>
              <button
                onClick={() => handleViewModeChange("dual")}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  background: viewMode === "dual" ? "#243A6E" : "transparent",
                  color: viewMode === "dual" ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                ▭▭
              </button>
            </div>
          </div>
        </div>

        {viewMode === "single" ? (
          <div
            style={{
              lineHeight: settings.lineHeight,
              whiteSpace: "pre-wrap",
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily,
              color: settings.backgroundColor === "#1a1a1a" ? "#e0e0e0" : "#333",
              minHeight: "400px",
            }}
          >
            {episode.content}
          </div>
        ) : (
          <div>
            {/* 듀얼 모드 헤더 */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginBottom: "24px",
                flexDirection: "row",
              }}
            >
              {/* 왼쪽 언어 선택 */}
              <div style={{ flex: 1 }}>
                <select
                  value={leftLanguage}
                  onChange={(e) => setLeftLanguage(e.target.value as Language)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e5e5e5",
                    background: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                    width: "100%",
                    maxWidth: "200px",
                  }}
                >
                  {availableLanguages && availableLanguages.length > 0 ? (
                    availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {getLanguageName(lang)}
                      </option>
                    ))
                  ) : (
                    <option value="ko">Korean</option>
                  )}
                </select>
              </div>
              
              {/* 오른쪽 언어 선택 */}
              <div style={{ flex: 1 }}>
                <select
                  value={rightLanguage}
                  onChange={(e) => setRightLanguage(e.target.value as Language)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e5e5e5",
                    background: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                    width: "100%",
                    maxWidth: "200px",
                  }}
                >
                  {availableLanguages && availableLanguages.length > 0 ? (
                    availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {getLanguageName(lang)}
                      </option>
                    ))
                  ) : (
                    <option value="en">English</option>
                  )}
                </select>
              </div>
            </div>

            {/* 듀얼 모드 콘텐츠 - 좌우 분할 */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  flex: 1,
                  lineHeight: settings.lineHeight,
                  whiteSpace: "pre-wrap",
                  fontSize: `${settings.fontSize}px`,
                  fontFamily: settings.fontFamily,
                  color: settings.backgroundColor === "#1a1a1a" ? "#e0e0e0" : "#333",
                  minHeight: "400px",
                  paddingRight: "12px",
                  borderRight: "1px solid #e5e5e5",
                }}
              >
                {getContent(leftLanguage)}
              </div>
              <div
                style={{
                  flex: 1,
                  lineHeight: settings.lineHeight,
                  whiteSpace: "pre-wrap",
                  fontSize: `${settings.fontSize}px`,
                  fontFamily: settings.fontFamily,
                  color: settings.backgroundColor === "#1a1a1a" ? "#e0e0e0" : "#333",
                  minHeight: "400px",
                  paddingLeft: "12px",
                }}
              >
                {getContent(rightLanguage)}
              </div>
            </div>
          </div>
        )}

        {/* 네비게이션 영역 */}
        <div
          style={{
            marginTop: "60px",
            paddingTop: "32px",
            borderTop: "1px solid #e5e5e5",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {prevEpisode ? (
            <Link
              href={`/novels/${novelId}/episodes/${prevEpisode.ep}`}
              style={navButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#243A6E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e5e5e5";
              }}
            >
              ← Previous
            </Link>
          ) : (
            <div style={{ ...navButtonStyle, opacity: 0.5, cursor: "not-allowed" }}>
              ← Previous
            </div>
          )}

          {nextEpisode ? (
            <Link
              href={`/novels/${novelId}/episodes/${nextEpisode.ep}`}
              style={navButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#243A6E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#e5e5e5";
              }}
            >
              Next →
            </Link>
          ) : (
            <div style={{ ...navButtonStyle, opacity: 0.5, cursor: "not-allowed" }}>
              Next →
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

