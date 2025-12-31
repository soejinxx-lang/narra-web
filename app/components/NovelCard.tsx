type NovelCardProps = {
  novel: any;
};

export default function NovelCard({ novel }: NovelCardProps) {
  return (
    <div
      style={{
        width: "93%",
        margin: "0 auto",
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        background: "#fff", // 카드 배경은 흰색
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 이미지 영역 */}
      <div
        style={{
          margin: 12,
        }}
      >
        {/* 남색 패널 (2:3 고정) */}
        <div
          style={{
            aspectRatio: "2 / 3",
            background: "#243A6E", // 남색 패널
            borderRadius: 14,
            padding: 6, // 남색과 이미지 사이 여백
            overflow: "hidden",
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
              }}
            />
          )}
        </div>
      </div>

      {/* 제목 영역 */}
      <div
        style={{
          padding: "10px 12px 14px",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {novel.title}
      </div>
    </div>
  );
}
