type NovelCardProps = {
  novel: any;
};

export default function NovelCard({ novel }: NovelCardProps) {
  return (
    <div
      style={{
        width: "93%",
        margin: "0 auto",
        aspectRatio: "1 / 2", // ✅ 카드 전체는 1:2
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 남색 패널 (2:3) */}
      <div
        style={{
          margin: 12,
          aspectRatio: "2 / 3",
          background: "#243A6E",
          borderRadius: 14,
          padding: 6, // ✅ 이미지와의 여백
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
              objectFit: "cover", // ✅ 잘려도 OK
              display: "block",
              borderRadius: 10,
              background: "#fff",
            }}
          />
        )}
      </div>

      {/* 제목 영역 */}
      <div
        style={{
          padding: "8px 12px 14px",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
          flexGrow: 1, // ✅ 남은 공간 채우기
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
