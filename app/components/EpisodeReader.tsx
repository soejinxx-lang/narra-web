"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ReadingSettings, { ReadingSettings as ReadingSettingsType } from "./ReadingSettings";
import ShareButton from "./ShareButton";
import { saveReadingProgress, getCurrentUserId, getNovelProgress, saveSessionScrollPosition, getSessionReadingProgress } from "@/app/utils/readingProgress";
import { markAsCompleted } from "@/app/utils/library";

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
    studyMode: false,
  });
  
  // 기본 8개 언어로 초기화
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>(["ko", "en", "ja", "zh", "es", "fr", "de", "pt"]);
  
  // ====================================
  // ✅ Phase 1: localStorage 언어 설정
  // ====================================
  const [singleLanguage, setSingleLanguage] = useState<Language>(() => {
    // 초기값: localStorage에서 읽기
    if (typeof window !== "undefined") {
      const userId = getCurrentUserId();
      
      // 로그인 사용자: user-specific key
      // 비로그인 사용자: global key
      const storageKey = userId 
        ? `preferredLanguage_${userId}` 
        : "preferredLanguage";
      
      const saved = localStorage.getItem(storageKey);
      if (saved && ["ko", "en", "ja", "zh", "es", "fr", "de", "pt"].includes(saved)) {
        return saved as Language;
      }
    }
    return "ko"; // 기본값
  });
  
  // 언어 변경 시 localStorage 저장
  const handleLanguageChange = (newLang: Language) => {
    setSingleLanguage(newLang);
    
    if (typeof window !== "undefined") {
      const userId = getCurrentUserId();
      const storageKey = userId 
        ? `preferredLanguage_${userId}` 
        : "preferredLanguage";
      
      localStorage.setItem(storageKey, newLang);
      
      // ✅ Phase 2: 로그인 사용자는 서버에도 저장 (TODO)
      if (userId) {
        // 추후 구현: saveLanguagePreference(userId, newLang)
        console.log(`[TODO] Save language preference to server: ${userId} -> ${newLang}`);
      }
    }
  };
  // ====================================
  
  // 번역 데이터 캐시 (클라이언트 사이드에서 로드)
  const [translations, setTranslations] = useState<Record<string, any>>({
    ko: episode, // 기본 한국어는 서버에서 가져온 데이터
  });
  
  // 비공개 언어 목록 (is_public = false)
  const [unavailableLanguages, setUnavailableLanguages] = useState<Set<string>>(new Set());
  
  // 읽은 위치 추적을 위한 ref
  const contentRef = useRef<HTMLDivElement>(null);

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

  // 읽은 위치 복원 및 추적 (페이지 전체 스크롤)
  useEffect(() => {

    const userId = getCurrentUserId();
    const currentEpisodeEp = String(episode.ep);
    
    // 저장된 스크롤 위치 불러오기
    let savedScrollPosition = 0;
    let savedProgress = 0;
    
    if (userId) {
      // 로그인한 사용자: localStorage에서 불러오기
      const progress = getNovelProgress(userId, novelId);
      if (progress && progress.episodeEp === currentEpisodeEp && progress.scrollPosition !== undefined) {
        savedScrollPosition = progress.scrollPosition;
        savedProgress = progress.progress;
      }
    } else {
      // 비로그인 사용자: sessionStorage에서 불러오기
      const sessionProgress = getSessionReadingProgress();
      if (sessionProgress[novelId] && sessionProgress[novelId].episodeEp === currentEpisodeEp && sessionProgress[novelId].scrollPosition !== undefined) {
        savedScrollPosition = sessionProgress[novelId].scrollPosition || 0;
        savedProgress = sessionProgress[novelId].progress || 0;
      }
    }
    
    // 저장된 스크롤 위치로 복원 (페이지 전체)
    if (savedScrollPosition > 0) {
      const restoreScroll = () => {
        if (contentRef.current) {
          const elementTop = contentRef.current.offsetTop;
          const targetPosition = elementTop + savedScrollPosition;
          window.scrollTo({ top: targetPosition, behavior: "auto" });
        }
      };
      
      // 약간의 지연을 두어 콘텐츠가 렌더링된 후 복원
      setTimeout(restoreScroll, 100);
      setTimeout(restoreScroll, 500);
    }

    // 스크롤 위치 추적 및 저장 (페이지 전체)
    let saveTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!contentRef.current) return;
      
      // 디바운싱: 스크롤 이벤트가 너무 많이 발생하지 않도록
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        if (!contentRef.current) return;
        
        const elementTop = contentRef.current.offsetTop;
        const elementBottom = elementTop + contentRef.current.offsetHeight;
        const windowTop = window.scrollY;
        const windowBottom = windowTop + window.innerHeight;
        
        // 본문 영역의 전체 높이
        const totalHeight = contentRef.current.offsetHeight;
        
        // 현재 스크롤 위치 (본문 영역 기준)
        const scrollPosition = Math.max(0, windowTop - elementTop);
        
        // 시작 = 1%, 끝 = 100%로 계산
        // 스크롤 가능한 전체 높이 (본문 높이 - 화면 높이)
        const scrollableHeight = Math.max(1, totalHeight - window.innerHeight);
        
        // 1%부터 시작하도록 계산 (0%가 아닌 1%)
        // 스크롤이 시작 위치면 1%, 끝까지 스크롤하면 100%
        const progress = scrollableHeight > 0 
          ? Math.min(100, Math.max(1, Math.round(1 + (scrollPosition / scrollableHeight) * 99)))
          : 1;
        
        // 진도 및 스크롤 위치 저장
        if (userId) {
          saveReadingProgress(userId, novelId, currentEpisodeEp, progress, scrollPosition);
          
          // 100% 달성 시 완독으로 표시
          if (progress >= 100) {
            markAsCompleted(userId, novelId, currentEpisodeEp);
          }
        } else {
          // 비로그인 사용자: sessionStorage에 저장
          saveSessionScrollPosition(novelId, currentEpisodeEp, scrollPosition, progress);
        }
      }, 500); // 0.5초마다 저장
    };

    window.addEventListener("scroll", handleScroll);
    
    // 초기 진도 저장
    handleScroll();

    return () => {
      clearTimeout(saveTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [novelId, episode.ep]);

  const handleSettingsChange = (newSettings: ReadingSettingsType) => {
    setSettings(newSettings);
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
          console.log("RAW_TRANSLATION:", JSON.stringify(data.content));
          
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
            setUnavailableLanguages((prev) => new Set(prev).add(lang));
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
            setUnavailableLanguages((prev) => new Set(prev).add(lang));
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
            setUnavailableLanguages((prev) => new Set(prev).add(lang));
            return;
          }
          
          // status가 PENDING이면 번역이 아직 준비되지 않음
          if (data.status === "PENDING") {
            console.warn(`[${lang}] Translation status is PENDING`);
            setTranslations((prev) => ({
              ...prev,
              [lang]: { ...data, translationNotReady: true },
            }));
            setUnavailableLanguages((prev) => new Set(prev).add(lang));
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

    // Study Mode일 때는 양쪽 언어 모두 로드
    if (settings.studyMode) {
      const leftLang = settings.leftLanguage || "ko";
      const rightLang = settings.rightLanguage || "en";
      loadTranslation(leftLang);
      loadTranslation(rightLang);
    } else {
      // Normal Mode일 때는 선택한 언어만 로드
      loadTranslation(singleLanguage);
    }
  }, [settings.studyMode, settings.leftLanguage, settings.rightLanguage, singleLanguage, novelId, episode.ep, translations]);

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
          maxWidth: settings.studyMode ? "100%" : "900px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
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

        {settings.studyMode ? (
          /* Study Mode: 2개 언어 나란히 */
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
            }}
          >
            {/* 왼쪽 언어 */}
            <div
              ref={contentRef}
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
              {getContent(settings.leftLanguage || "ko")}
            </div>
            
            {/* 오른쪽 언어 */}
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
              {getContent(settings.rightLanguage || "en")}
            </div>
          </div>
        ) : (
          /* Normal Mode: 단일 언어 */
          <>
            {/* 언어 선택 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <select
                value={singleLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e5e5",
                  background: "#fff",
                  fontSize: "14px",
                  cursor: "pointer",
                  maxWidth: "200px",
                }}
              >
                {availableLanguages.map((lang) => {
                  const isUnavailable = unavailableLanguages.has(lang);
                  return (
                    <option 
                      key={lang} 
                      value={lang}
                      disabled={isUnavailable}
                      style={{
                        opacity: isUnavailable ? 0.4 : 1,
                        color: isUnavailable ? "#999" : "inherit",
                      }}
                    >
                      {getLanguageName(lang)}
                      {isUnavailable ? " (비공개)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 본문 */}
            <div
              ref={contentRef}
              style={{
                lineHeight: settings.lineHeight,
                whiteSpace: "pre-wrap",
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily,
                color: settings.backgroundColor === "#1a1a1a" ? "#e0e0e0" : "#333",
                minHeight: "400px",
              }}
            >
              {getContent(singleLanguage)}
            </div>
          </>
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
