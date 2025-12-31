type NovelCardProps = {
  novel: any;
};

export default function NovelCard({ novel }: NovelCardProps) {
  return (
    <div
      style={{
        width: "93%",
        margin: "0 auto",
        aspectRatio: "5 / 9",
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 남색 패널 */}
      <div
        style={{
          aspectRatio: "2 / 3",
          background: "#243A6E",
          padding: 14,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {novel.cover_url && (
          <img
            src={novel.cover_url}
            alt={novel.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: 10,
              background: "#fff",
              border: "0.2cm solid #ffffff", // ✅ 이미지 흰색 테두리
            }}
          />
        )}
      </div>

      {/* 제목 영역 */}
      <div
        style={{
          padding: "10px 12px 14px",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
          flexGrow: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {novel.title}
      </div>
    </div>
  );
}

