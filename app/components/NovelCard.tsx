type NovelCardProps = {
  novel: any;
};

export default function NovelCard({ novel }: NovelCardProps) {
  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto",
        aspectRatio: "5 / 10",
        border: "1.5px solid #e5e5e5",
        borderRadius: 18,
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
          padding: "4px",
          overflow: "hidden",
          flexShrink: 0,
          borderRadius: 16,
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
              borderRadius: 14,
              background: "#fff",
              border: "0.05cm solid #ffffff",
            }}
          />
        )}
      </div>

      {/* 제목 영역 */}
      <div
        style={{
          padding: "14px 12px 18px",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          wordBreak: "break-word",
          overflow: "hidden",
        }}
      >
        {novel.title}
      </div>
    </div>
  );
}
