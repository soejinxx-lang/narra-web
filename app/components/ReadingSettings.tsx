"use client";

import { useState, useEffect } from "react";

type ReadingSettingsProps = {
  onSettingsChange: (settings: ReadingSettings) => void;
  singleLanguage?: string;
  availableLanguages?: string[];
  unavailableLanguages?: Set<string>;
  onSingleLanguageChange?: (lang: string) => void;
};

export type ReadingSettings = {
  fontSize: number;
  lineHeight: number;
  backgroundColor: string;
  fontFamily: string;
  studyMode: boolean;
  audioMode: boolean;
  leftLanguage?: string;
  rightLanguage?: string;
};

const defaultSettings: ReadingSettings = {
  fontSize: 16,
  lineHeight: 1.8,
  backgroundColor: "#faf9f6",
  fontFamily: "inherit",
  studyMode: false,
  audioMode: false,
  leftLanguage: "ko",
  rightLanguage: "en",
};

const backgroundColors = [
  { name: "Light", value: "#faf9f6" },
  { name: "White", value: "#ffffff" },
  { name: "Beige", value: "#f5f1e8" },
  { name: "Dark", value: "#1a1a1a" },
];

const fontFamilies = [
  { name: "Default", value: "inherit" },
  { name: "Sans", value: '"Noto Sans KR", sans-serif' },
  { name: "Serif", value: '"Noto Serif KR", serif' },
  { name: "Batang", value: '"KoPub Batang", serif' },
  { name: "Nanum Gothic", value: '"Nanum Gothic", sans-serif' },
  { name: "Nanum Myeongjo", value: '"Nanum Myeongjo", serif' },
  { name: "Gowun Batang", value: '"Gowun Batang", serif' },
  { name: "Gowun Dodum", value: '"Gowun Dodum", sans-serif' },
];

const languages = [
  { code: "ko", name: "Korean" },
  { code: "en", name: "English" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Chinese" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "id", name: "Indonesian" },
];

export default function ReadingSettings({
  onSettingsChange,
  singleLanguage,
  availableLanguages,
  unavailableLanguages,
  onSingleLanguageChange,
}: ReadingSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);

  useEffect(() => {
    // 濡쒖뺄 ?ㅽ넗由ъ??먯꽌 ?ㅼ젙 遺덈윭?ㅺ린
    const saved = localStorage.getItem("readingSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        // ?뚯떛 ?ㅽ뙣 ??湲곕낯媛??ъ슜
      }
    }
  }, []);

  useEffect(() => {
    onSettingsChange(settings);
    localStorage.setItem("readingSettings", JSON.stringify(settings));
  }, [settings, onSettingsChange]);

  const updateSetting = <K extends keyof ReadingSettings>(
    key: K,
    value: ReadingSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const currentBackground =
    backgroundColors.find((bg) => bg.value === settings.backgroundColor) || backgroundColors[0];
  const currentFont = fontFamilies.find((font) => font.value === settings.fontFamily) || fontFamilies[0];

  const toggleBackgroundOpen = () => {
    setIsBackgroundOpen((prev) => !prev);
    setIsFontOpen(false);
  };

  const toggleFontOpen = () => {
    setIsFontOpen((prev) => !prev);
    setIsBackgroundOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "#243A6E",
          color: "#fff",
          border: "none",
          padding: "10px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "0",
        }}
        title="Reading Settings"
      >
        Aa
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              zIndex: 101,
              minWidth: "280px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={settings.fontSize}
                onChange={(e) => updateSetting("fontSize", parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                Line Height: {settings.lineHeight.toFixed(1)}
              </label>
              <input
                type="range"
                min="1.4"
                max="3.5"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSetting("lineHeight", parseFloat(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                Background Color
              </label>
              <div style={{ position: "relative" }}>
                <button
                  onClick={toggleBackgroundOpen}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e5e5e5",
                    background: "#fff",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: currentBackground.value,
                        border: "1px solid #e5e5e5",
                      }}
                    />
                    <span>{currentBackground.name}</span>
                  </span>
                  <span>v</span>
                </button>

                {isBackgroundOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      zIndex: 10,
                    }}
                  >
                    {backgroundColors.map((bg) => (
                      <button
                        key={bg.value}
                        onClick={() => {
                          updateSetting("backgroundColor", bg.value);
                          setIsBackgroundOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          borderBottom: "1px solid #f0f0f0",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          fontWeight: settings.backgroundColor === bg.value ? 600 : 400,
                        }}
                      >
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: bg.value,
                            border: "1px solid #e5e5e5",
                          }}
                        />
                        <span>{bg.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                Font Family
              </label>
              <div style={{ position: "relative" }}>
                <button
                  onClick={toggleFontOpen}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e5e5e5",
                    background: "#fff",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    fontFamily: currentFont.value,
                  }}
                >
                  <span>{currentFont.name}</span>
                  <span>v</span>
                </button>

                {isFontOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      zIndex: 10,
                    }}
                  >
                    {fontFamilies.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => {
                          updateSetting("fontFamily", font.value);
                          setIsFontOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          borderBottom: "1px solid #f0f0f0",
                          background: "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          fontSize: "13px",
                          fontFamily: font.value,
                          fontWeight: settings.fontFamily === font.value ? 600 : 400,
                        }}
                      >
                        <span>{font.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                Reading Mode
              </label>
              {/* Tab-style buttons */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <button
                  onClick={() => updateSetting("studyMode", false)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: "6px",
                    background: !settings.studyMode ? "#243A6E" : "#f5f5f5",
                    color: !settings.studyMode ? "#fff" : "#666",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                >
                  Normal
                </button>
                <button
                  onClick={() => updateSetting("studyMode", true)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "none",
                    borderRadius: "6px",
                    background: settings.studyMode ? "#243A6E" : "#f5f5f5",
                    color: settings.studyMode ? "#fff" : "#666",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                >
                  Study Mode
                </button>
              </div>

              {/* Language selection based on mode */}
              {!settings.studyMode && onSingleLanguageChange ? (
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#666" }}>
                    Language
                  </label>
                  <select
                    value={singleLanguage || "ko"}
                    onChange={(e) => onSingleLanguageChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #e5e5e5",
                      background: "#fff",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {languages.map((lang) => {
                      const isUnavailable = unavailableLanguages?.has(lang.code);
                      return (
                        <option key={lang.code} value={lang.code} disabled={isUnavailable}>
                          {lang.name}
                          {isUnavailable ? " (Unavailable)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : settings.studyMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#666" }}>
                      Left Language
                    </label>
                    <select
                      value={settings.leftLanguage || "ko"}
                      onChange={(e) => updateSetting("leftLanguage", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e5e5",
                        background: "#fff",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", color: "#666" }}>
                      Right Language
                    </label>
                    <select
                      value={settings.rightLanguage || "en"}
                      onChange={(e) => updateSetting("rightLanguage", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e5e5",
                        background: "#fff",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                Audio Mode
              </label>
              <button
                onClick={() => updateSetting("audioMode", !settings.audioMode)}
                style={{
                  padding: "10px 12px",
                  border: `2px solid ${settings.audioMode ? "#243A6E" : "#e5e5e5"}`,
                  borderRadius: "6px",
                  background: settings.audioMode ? "#f0f4ff" : "#fff",
                  color: "#333",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <span>{settings.audioMode ? "On" : "Off"}</span>
                <span>Audio Mode</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

