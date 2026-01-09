"use client";

import { useState, useEffect } from "react";

type ReadingSettingsProps = {
  onSettingsChange: (settings: ReadingSettings) => void;
};

export type ReadingSettings = {
  fontSize: number;
  lineHeight: number;
  backgroundColor: string;
  fontFamily: string;
};

const defaultSettings: ReadingSettings = {
  fontSize: 16,
  lineHeight: 1.8,
  backgroundColor: "#faf9f6",
  fontFamily: "inherit",
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

export default function ReadingSettings({ onSettingsChange }: ReadingSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);

  useEffect(() => {
    // 로컬 스토리지에서 설정 불러오기
    const saved = localStorage.getItem("readingSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        // 파싱 실패 시 기본값 사용
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
          fontSize: "14px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "0",
        }}
      >
        ⚙️
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
                max="2.5"
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
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {backgroundColors.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => updateSetting("backgroundColor", bg.value)}
                    style={{
                      padding: "8px 12px",
                      border: `2px solid ${settings.backgroundColor === bg.value ? "#243A6E" : "#e5e5e5"}`,
                      borderRadius: "6px",
                      background: bg.value,
                      color: bg.value === "#1a1a1a" ? "#fff" : "#333",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>
                Font Family
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {fontFamilies.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => updateSetting("fontFamily", font.value)}
                    style={{
                      padding: "8px 12px",
                      border: `2px solid ${settings.fontFamily === font.value ? "#243A6E" : "#e5e5e5"}`,
                      borderRadius: "6px",
                      background: settings.fontFamily === font.value ? "#f0f4ff" : "#fff",
                      color: "#333",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      textAlign: "left",
                      fontFamily: font.value,
                    }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

