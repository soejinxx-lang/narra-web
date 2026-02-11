"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ReadingSettings, { ReadingSettings as ReadingSettingsType } from "./ReadingSettings";
import AudioPlayer from "./AudioPlayer";
import ShareButton from "./ShareButton";
import CommentSection from "./CommentSection";
import { saveReadingProgress, getCurrentUserId, getNovelProgress, saveSessionScrollPosition, getSessionReadingProgress } from "@/app/utils/readingProgress";
import { markAsCompleted } from "@/app/utils/library";
import { toRoman } from "@/lib/utils";

type EpisodeReaderProps = {
  episode: any;
  novel: any;
  novelId: string;
  prevEpisode: any;
  nextEpisode: any;
};

type ViewMode = "single" | "dual";
type Language = string; // ?몄뼱 肄붾뱶 (←  "ko", "en", "ja" ←

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
    audioMode: false,
  });

  // 기본 8개 언어로 초기화
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([
    "ko",
    "en",
    "ja",
    "zh",
    "es",
    "fr",
    "de",
    "pt",
    "id",
  ]);

  // ====================================
  // ← Phase 1: localStorage ?몄뼱 ?ㅼ젙
  // ====================================
  const [singleLanguage, setSingleLanguage] = useState<Language>(() => {
    // 珥덇린媛? localStorage?먯꽌 ?쎄린
    if (typeof window !== "undefined") {
      const userId = getCurrentUserId();

      // 濡쒓렇← ?ъ슜←  user-specific key
      // 鍮꾨줈洹몄씤 ?ъ슜←  global key
      const storageKey = userId
        ? `preferredLanguage_${userId}`
        : "preferredLanguage";

      const saved = localStorage.getItem(storageKey);
      if (saved && ["ko", "en", "ja", "zh", "es", "fr", "de", "pt", "id"].includes(saved)) {
        return saved as Language;
      }
    }
    return "ko"; // Default language
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

      // ← Phase 2: 濡쒓렇← ?ъ슜?먮뒗 ?쒕쾭?먮룄 ?← (TODO)
      if (userId) {
        // 異뷀썑 援ы쁽: saveLanguagePreference(userId, newLang)
        console.log(`[TODO] Save language preference to server: ${userId} -> ${newLang}`);
      }
    }
  };
  // ====================================

  // 번역 데이터 캐시 (언어 사이클에서 로드)
  const sourceLanguage = novel?.source_language || "ko";
  const [translations, setTranslations] = useState<Record<string, any>>({
    [sourceLanguage]: episode, // Use source language as key
  });

  // Unavailable)?몄뼱 紐⑸줉 (is_public = false)
  const [unavailableLanguages, setUnavailableLanguages] = useState<Set<string>>(new Set());

  // Ref for scroll position tracking
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("readingSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (e) {
        // 기본값 사용
      }
    }

    // Smart Copy: Add copyright notice to copied text
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection) return;

      const copyText = selection.toString();
      if (copyText.length > 0) {
        const footer = "\n\n© narra.kr - AI training and unauthorized use prohibited.";
        e.clipboardData?.setData('text/plain', copyText + footer);
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopy);

    // localStorage?먯꽌 ?몄뼱 紐⑸줉 遺덈윭?ㅺ린
    if (typeof window !== "undefined") {
      // ?щ윭 媛?ν븳 ← ?대쫫 ?뺤씤
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
        if (saved !== null) {
          try {
            const parsed = JSON.parse(saved as string);
            if (Array.isArray(parsed) && parsed.length > 0) {
              languages = parsed;
              break;
            }
          } catch (e) {
            // ?뚯떛 ?ㅽ뙣 ← ?ㅼ쓬 ← ?룄
          }
        }
      }

      // ?몄뼱 紐⑸줉← ?놁쑝硫?湲곕낯媛← ъ슜 (8媛← 몄뼱)
      if (languages.length === 0) {
        languages = ["ko", "en", "ja", "zh", "es", "fr", "de", "pt", "id"];
        // 湲곕낯媛믪쓣 localStorage?????
        localStorage.setItem("availableLanguages", JSON.stringify(languages));
      }

      setAvailableLanguages(languages);
    }

    // ✅ Survival Mode: Increment View Count
    const incrementViewCount = async () => {
      try {
        await fetch(`/api/episodes/${episode.id}/view`, {
          method: "POST",
          cache: "no-store" // Ensure it hits the server
        });
      } catch (error) {
        // Silently fail for views
        console.error("Failed to increment view count", error);
      }
    };

    // Call once on mount
    incrementViewCount();


    // Track episode read for daily missions
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) return; // 濡쒓렇?명븯吏 ?딆? 寃쎌슦 移댁슫?명븯吏 ?딆쓬

      try {
        const user = currentUser ? JSON.parse(currentUser as string) : null;
        const userId = user.id;
        // 誘멸뎅 ?숇? ?쒓컙 湲곗? ?ㅻ뒛 ?좎쭨
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

    return () => {
      document.removeEventListener('copy', handleCopy);
    };
  }, [novelId, episode]);

  // ?쎌? ?꾩튂 蹂듭썝 諛?異붿쟻 (?섏씠吏 ?꾩껜 ?ㅽ겕濡?
  useEffect(() => {

    const userId = getCurrentUserId();
    const currentEpisodeEp = String(episode.ep);

    // ??λ맂 ?ㅽ겕濡← 꾩튂 遺덈윭?ㅺ린
    let savedScrollPosition = 0;
    let savedProgress = 0;

    if (userId) {
      // 濡쒓렇?명븳 ?ъ슜←  localStorage?먯꽌 遺덈윭?ㅺ린
      const progress = getNovelProgress(userId, novelId);
      if (progress && progress.episodeEp === currentEpisodeEp && progress.scrollPosition !== undefined) {
        savedScrollPosition = progress.scrollPosition;
        savedProgress = progress.progress;
      }
    } else {
      // 鍮꾨줈洹몄씤 ?ъ슜←  sessionStorage?먯꽌 遺덈윭?ㅺ린
      const sessionProgress = getSessionReadingProgress();
      if (sessionProgress[novelId] && sessionProgress[novelId].episodeEp === currentEpisodeEp && sessionProgress[novelId].scrollPosition !== undefined) {
        savedScrollPosition = sessionProgress[novelId].scrollPosition || 0;
        savedProgress = sessionProgress[novelId].progress || 0;
      }
    }

    // ??λ맂 ?ㅽ겕濡← 꾩튂濡?蹂듭썝 (?섏씠吏 ?꾩껜)
    if (savedScrollPosition > 0) {
      const restoreScroll = () => {
        if (contentRef.current) {
          const elementTop = contentRef.current.offsetTop;
          const targetPosition = elementTop + savedScrollPosition;
          window.scrollTo({ top: targetPosition, behavior: "auto" });
        }
      };

      // ?쎄컙← 吏?곗쓣 ?먯뼱 肄섑뀗痢좉? ?뚮뜑留곷맂 ← 蹂듭썝
      setTimeout(restoreScroll, 100);
      setTimeout(restoreScroll, 500);
    }

    // ?ㅽ겕濡← 꾩튂 異붿쟻 諛← ← (?섏씠吏 ?꾩껜)
    let saveTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!contentRef.current) return;

      // ?붾컮?댁떛: ?ㅽ겕濡??대깽?멸? ?덈Т 留롮씠 諛쒖깮?섏? ?딅룄濡?
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        if (!contentRef.current) return;

        const elementTop = contentRef.current.offsetTop;
        const elementBottom = elementTop + contentRef.current.offsetHeight;
        const windowTop = window.scrollY;
        const windowBottom = windowTop + window.innerHeight;

        // 蹂몃Ц ?곸뿭← ?꾩껜 ?믪씠
        const totalHeight = contentRef.current.offsetHeight;

        // ?꾩옱 ?ㅽ겕濡← 꾩튂 (蹂몃Ц ?곸뿭 湲곗?)
        const scrollPosition = Math.max(0, windowTop - elementTop);

        // ?쒖옉 = 1%, ← = 100%濡?怨꾩궛
        // ?ㅽ겕濡?媛?ν븳 ?꾩껜 ?믪씠 (蹂몃Ц ?믪씠 - ?붾㈃ ?믪씠)
        const scrollableHeight = Math.max(1, totalHeight - window.innerHeight);

        // 1%遺← ?쒖옉?섎룄濡?怨꾩궛 (0%媛 ?꾨땶 1%)
        // ?ㅽ겕濡ㅼ씠 ?쒖옉 ?꾩튂硫?1%, ?앷퉴吏 ?ㅽ겕濡ㅽ븯硫?100%
        const progress = scrollableHeight > 0
          ? Math.min(100, Math.max(1, Math.round(1 + (scrollPosition / scrollableHeight) * 99)))
          : 1;

        // 吏꾨룄 諛??ㅽ겕濡??꾩튂 ???
        if (userId) {
          saveReadingProgress(userId, novelId, currentEpisodeEp, progress, scrollPosition);

          // 100% ?ъ꽦 ← ?꾨룆?쇰줈 ?쒖떆
          if (progress >= 100) {
            markAsCompleted(userId, novelId, currentEpisodeEp);
          }
        } else {
          // 鍮꾨줈洹몄씤 ?ъ슜?? sessionStorage?????
          saveSessionScrollPosition(novelId, currentEpisodeEp, scrollPosition, progress);
        }
      }, 500); // 0.5초마다 저장
    };

    window.addEventListener("scroll", handleScroll);

    // 珥덇린 吏꾨룄 ???
    handleScroll();

    return () => {
      clearTimeout(saveTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [novelId, episode.ep]);

  const handleSettingsChange = (newSettings: ReadingSettingsType) => {
    setSettings(newSettings);
  };




  // 언어 코드를 이름으로 변환
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
      id: "Indonesian",
    };
    return languageNames[lang] || lang.toUpperCase();
  };

  // 언어별 콘텐츠 로드 (클라이언트에서 호출)
  useEffect(() => {
    const loadTranslation = async (lang: Language) => {
      // ?대? 濡쒕뱶← ?몄뼱硫← ㅽ궢
      if (translations[lang]) {
        return;
      }

      try {
        // API route瑜← 듯빐 ?몄텧
        const res = await fetch(
          `/api/novels/${encodeURIComponent(novelId)}/episodes/${encodeURIComponent(episode.ep)}?lang=${lang}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const data = await res.json();


          // ?묐떟← language ?꾨뱶媛 ?붿껌← ?몄뼱? ?쇱튂?섎뒗吏 ?뺤씤
          if (data.language && data.language !== lang) {
            console.warn(
              `[${lang}] Language mismatch: requested ${lang}, received ${data.language}`
            );
            // ?몄뼱媛 ?쇱튂?섏? ?딆쑝硫?踰덉뿭← 以鍮꾨릺吏 ?딆? 寃껋쑝濡?泥섎━
            setTranslations((prev) => ({
              ...prev,
              [lang]: { ...data, translationNotReady: true },
            }));
            setUnavailableLanguages((prev) => new Set(prev).add(lang));
            return;
          }

          // ?섎せ← ?묐떟 泥댄겕 (梨쀫큸 ?묐떟 ←
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
            // 踰덉뿭??以鍮꾨릺吏 ?딆븯?ㅻ뒗 寃껋쓣 ?쒖떆?섍린 ?꾪빐 鍮?媛앹껜 ???
            setTranslations((prev) => ({
              ...prev,
              [lang]: { ...data, content: "", translationNotReady: true },
            }));
            setUnavailableLanguages((prev) => new Set(prev).add(lang));
            return;
          }

          // ?묐떟← 媛앹껜?닿퀬 content ?꾨뱶媛 ?덈뒗吏 ?뺤씤
          if (!data || typeof data !== "object") {
            console.error(`[${lang}] Invalid response format:`, data);
            return;
          }

          // content ?꾨뱶媛 ?녾굅???덈Т 吏㏃쑝硫?踰덉뿭???꾩쭅 以鍮꾨릺吏 ?딆? 寃?
          if (!data.content || data.content.trim().length < 10) {
            console.warn(`[${lang}] Translation not available (status: ${data.status || "unknown"})`);
            setTranslations((prev) => ({
              ...prev,
              [lang]: { ...data, translationNotReady: true },
            }));
            setUnavailableLanguages((prev) => new Set(prev).add(lang));
            return;
          }

          // status媛 PENDING?대㈃ 踰덉뿭← ?꾩쭅 以鍮꾨릺吏 ?딆쓬
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

    // Study Mode← ?뚮뒗 ?묒そ ?몄뼱 紐⑤몢 濡쒕뱶
    if (settings.studyMode) {
      const leftLang = settings.leftLanguage || "ko";
      const rightLang = settings.rightLanguage || "en";
      loadTranslation(leftLang);
      loadTranslation(rightLang);
    } else {
      // Normal Mode← ?뚮뒗 ?좏깮← ?몄뼱留?濡쒕뱶
      loadTranslation(singleLanguage);
    }
  }, [settings.studyMode, settings.leftLanguage, settings.rightLanguage, singleLanguage, novelId, episode.ep, translations]);

  // 언어별 콘텐츠 가져오기
  const getContent = (lang: Language) => {
    const translation = translations[lang];

    // 踰덉뿭← 以鍮꾨릺吏 ?딆? 寃쎌슦
    if (translation && translation.translationNotReady) {
      return `[Translation pending...]`;
    }

    if (translation && translation.content) {
      // 梨쀫큸 ?묐떟 泥댄겕
      const chatbotPatterns = [
        "Hello. How can I assist you today?",
        "Hello! How can I assist you today?",
      ];

      const isChatbotResponse = chatbotPatterns.some(
        (pattern) => translation.content.trim() === pattern
      );

      if (isChatbotResponse) {
        return `[Translation error detected. Please retry translation.]`;
      }

      // First, replace literal \n strings with actual newlines
      let processedContent = translation.content.replace(/\\n/g, '\n');

      // Convert \n\n to <p> tags for proper HTML rendering
      const paragraphs = processedContent
        .split('\n\n')
        .filter((p: string) => p.trim())
        .map((p: string) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
        .join('');

      return paragraphs || processedContent;
    }

    // ?쒓뎅?대뒗 湲곕낯 episode ?ъ슜
    if (lang === "ko") {
      return episode.content || "";
    }

    // ?ㅻⅨ ?몄뼱← 濡쒕뵫 以묒씠嫄곕굹 ?놁쓣 ← ?덉쓬
    return `[Loading translation...]`;
  };

  // 언어별 제목 가져오기
  const getTitle = (lang: Language) => {
    const translation = translations[lang];
    if (translation && translation.title) {
      return translation.title;
    }

    // ?쒓뎅?대뒗 湲곕낯 episode ?ъ슜
    if (lang === "ko") {
      return episode.title || "";
    }

    // ?ㅻⅨ ?몄뼱← 濡쒕뵫 以묒씠嫄곕굹 ?놁쓣 ← ?덉쓬
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
      {/* ?ㅻ뜑 ?곸뿭 */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e5e5",
          padding: "16px 24px",
          position: "fixed", // Changed from sticky to fixed
          top: 56, // Below global header
          left: 0,
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
            ←           </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {novel && <ShareButton novelId={novelId} novelTitle={novel.title || "Novel"} />}
            <ReadingSettings
              onSettingsChange={handleSettingsChange}
              singleLanguage={singleLanguage}
              availableLanguages={availableLanguages}
              unavailableLanguages={unavailableLanguages}
              onSingleLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </div>

      {/* 蹂몃Ц ?곸뿭 */}
      <div
        style={{
          maxWidth: settings.studyMode ? "100%" : "900px",
          margin: "0 auto",
          padding: "130px 24px 40px 24px", // Increased top padding from 40px to 130px
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
            {novel?.episode_format === "roman" ? toRoman(episode.ep) : `EP ${episode.ep}`} {episode.title ? `- ${episode.title}` : ""}
          </h1>
        </div>
        {/* Audio Player - 오디오 모드일 때만 표시 */}
        {settings.audioMode && (
          <div style={{ marginBottom: "32px" }}>
            <AudioPlayer
              novelId={novelId}
              episodeNumber={episode.ep}
              language={settings.studyMode ? (settings.leftLanguage || "ko") : singleLanguage}
            />
          </div>
        )}

        {settings.studyMode ? (
          /* Study Mode: 2媛← 몄뼱 ?섎← ?*/
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "flex-start",
            }}
          >
            {/* ?쇱そ ?몄뼱 */}
            <div
              ref={contentRef}
              style={{
                flex: 1,
                lineHeight: settings.lineHeight,
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily,
                color: settings.backgroundColor === "#1a1a1a" ? "#e0e0e0" : "#333",
                minHeight: "400px",
                paddingRight: "12px",
                borderRight: "1px solid #e5e5e5",
              }}
              dangerouslySetInnerHTML={{ __html: getContent(settings.leftLanguage || "ko") }}
            />

            {/* ?ㅻⅨ履← 몄뼱 */}
            <div
              style={{
                flex: 1,
                lineHeight: settings.lineHeight,
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily,
                color: settings.backgroundColor === "#1a1a1a" ? "#e0e0e0" : "#333",
                minHeight: "400px",
                paddingLeft: "12px",
              }}
              dangerouslySetInnerHTML={{ __html: getContent(settings.rightLanguage || "en") }}
            />
          </div>
        ) : (
          /* Normal Mode: ?⑥씪 ?몄뼱 */
          <div
            ref={contentRef}
            style={{
              lineHeight: settings.lineHeight,
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily,
              color: settings.backgroundColor === "#1a1a1a" ? "#e0e0e0" : "#333",
              minHeight: "400px",
            }}
            dangerouslySetInnerHTML={{ __html: getContent(singleLanguage) }}
          />
        )}

        {/* ?ㅻ퉬寃뚯씠← ?곸뿭 */}
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
              Next → </Link>
          ) : (
            <div style={{ ...navButtonStyle, opacity: 0.5, cursor: "not-allowed" }}>
              Next → </div>
          )}
        </div>

        {/* ✅ Community: Comment Section */}
        <CommentSection episodeId={episode.id} />
      </div>
    </main>
  );
}
