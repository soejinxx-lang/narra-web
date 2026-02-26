"use client";

import { useState, useEffect } from "react";
import { sanitizeInput, isValidInput } from "@/app/utils/security";
import { useLocale } from "../../lib/i18n";

interface FanArt {
  id: string;
  author: string;
  authorId?: string; // 로그인한 사용자의 경우
  image: string; // base64 또는 URL
  description: string;
  novelId: string;
  novelTitle: string;
  time: string;
}

export default function FanArtPage() {
  const { t } = useLocale();
  const [fanArts, setFanArts] = useState<FanArt[]>([]);
  const [novels, setNovels] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [selectedNovelId, setSelectedNovelId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; name?: string } | null>(null);

  useEffect(() => {
    // 로그인한 사용자 확인
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setAuthorName(user.name || user.username);
      } catch (e) {
        // 파싱 실패 시 무시
      }
    }

    // 소설 목록 불러오기
    const loadNovels = async () => {
      try {
        const res = await fetch("/api/novels", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const novelsData = data.novels || data;
          setNovels(novelsData);
          if (novelsData.length > 0) {
            setSelectedNovelId(novelsData[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load novels:", error);
      }
    };

    loadNovels();

    // 저장된 팬아트 불러오기
    const savedFanArts = localStorage.getItem("fanArts");
    if (savedFanArts) {
      try {
        setFanArts(JSON.parse(savedFanArts));
      } catch (e) {
        console.error("Failed to load fan arts:", e);
      }
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t("fanart.imageSizeError"));
        return;
      }

      // 이미지 파일만 허용
      if (!file.type.startsWith("image/")) {
        alert(t("fanart.imageTypeError"));
        return;
      }

      setImageFile(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 입력 sanitization 및 검증
    const sanitizedAuthor = sanitizeInput(authorName.trim());
    const sanitizedDescription = sanitizeInput(description.trim());

    if (!sanitizedAuthor || !selectedNovelId || !sanitizedDescription || !imageFile) {
      alert(t("fanart.fillAllFields"));
      return;
    }

    // 입력 유효성 검사
    if (!isValidInput(sanitizedAuthor, 100) || !isValidInput(sanitizedDescription, 2000)) {
      alert(t("fanart.invalidInput"));
      return;
    }

    if (!imagePreview) {
      alert(t("fanart.selectImage"));
      return;
    }

    const selectedNovel = novels.find((n) => n.id === selectedNovelId);
    if (!selectedNovel) {
      alert(t("fanart.selectNovel"));
      return;
    }

    const newFanArt: FanArt = {
      id: Date.now().toString(),
      author: sanitizedAuthor,
      authorId: currentUser?.id,
      image: imagePreview,
      description: sanitizedDescription,
      novelId: selectedNovelId,
      novelTitle: selectedNovel.title,
      time: new Date().toISOString(),
    };

    const updatedFanArts = [newFanArt, ...fanArts];
    setFanArts(updatedFanArts);
    localStorage.setItem("fanArts", JSON.stringify(updatedFanArts));

    // 폼 초기화
    setAuthorName(currentUser ? (currentUser.name || currentUser.username) : "");
    setSelectedNovelId(novels.length > 0 ? novels[0].id : "");
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    setShowUploadModal(false);
  };

  const getTimeAgo = (timeString: string): string => {
    try {
      const time = new Date(timeString);
      const now = new Date();
      const diffMs = now.getTime() - time.getTime();

      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);

      if (diffSeconds < 60) {
        return `${diffSeconds}초 전`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
      } else if (diffDays < 30) {
        return `${diffDays}일 전`;
      } else if (diffMonths < 12) {
        return `${diffMonths}개월 전`;
      } else {
        return time.toLocaleDateString();
      }
    } catch (e) {
      return timeString;
    }
  };

  return (
    <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          {t("fanart.title")}
        </h1>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            padding: "12px 24px",
            background: "#243A6E",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
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
          {t("fanart.upload")}
        </button>
      </div>

      {/* 팬아트 그리드 */}
      {fanArts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#999",
            fontSize: "16px",
          }}
        >
          {t("fanart.noArt")}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {fanArts.map((fanArt) => (
            <div
              key={fanArt.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e5e5e5",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  background: "#f0f0f0",
                }}
              >
                <img
                  src={fanArt.image}
                  alt={fanArt.description}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#243A6E",
                    fontWeight: 500,
                    marginBottom: "8px",
                  }}
                >
                  {fanArt.novelTitle}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#333",
                    marginBottom: "12px",
                    lineHeight: 1.6,
                    minHeight: "48px",
                  }}
                >
                  {fanArt.description}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "12px", color: "#999" }}>{t("fanart.by")} {fanArt.author}</div>
                  <div style={{ fontSize: "12px", color: "#999" }}>{getTimeAgo(fanArt.time)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 모달 */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: "20px",
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
                marginBottom: "24px",
                color: "#243A6E",
                fontFamily: '"KoPub Batang", serif',
              }}
            >
              {t("fanart.uploadTitle")}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* 작가 이름 */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#243A6E",
                  }}
                >
                  {t("fanart.authorName")}
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={t("fanart.enterName")}
                  required
                  disabled={!!currentUser}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: currentUser ? "#f5f5f5" : "#fff",
                  }}
                />
                {currentUser && (
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    {t("fanart.usingAccount")}
                  </div>
                )}
              </div>

              {/* 소설 선택 */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#243A6E",
                  }}
                >
                  {t("fanart.novel")}
                </label>
                <select
                  value={selectedNovelId}
                  onChange={(e) => setSelectedNovelId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: "#fff",
                  }}
                >
                  {novels.map((novel) => (
                    <option key={novel.id} value={novel.id}>
                      {novel.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 이미지 업로드 */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#243A6E",
                  }}
                >
                  {t("fanart.image")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
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
                {imagePreview && (
                  <div
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      maxHeight: "300px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      border: "1px solid #e5e5e5",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 설명 */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    color: "#243A6E",
                  }}
                >
                  {t("fanart.description")}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("fanart.descPlaceholder")}
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setAuthorName(currentUser ? (currentUser.name || currentUser.username) : "");
                    setDescription("");
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  style={{
                    padding: "12px 24px",
                    background: "transparent",
                    color: "#666",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {t("fanart.cancel")}
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    background: "#243A6E",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
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
                  {t("fanart.uploadBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

