type NovelCardProps = {
  novel: any;
};

export default function NovelCard({ novel }: NovelCardProps) {
  return (
    <div
      style={{
        width: "93%",
        margin: "0 auto",
        aspectRatio: "2 / 3",
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        background: "#fff", // ← 카드 배경은 계속 흰색
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 이미지 영역 */}
      <div
        style={{
          flex: 1,
          margin: 12,
          borderRadius: 14,
          background: "#fff", // ← 여기도 흰색
          padding: 4,          // ← 이 padding이 “사이 공간”
        }}
      >
        {/* 남색 띠 전용 레이어 */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#243A6E", // ← 딱 이 레이어만 남색
            padding: 3,
            borderRadius: 12,
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
                borderRadius: 9,
                background: "#fff",
              }}
            />
          )}
        </div>
      </div>

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
