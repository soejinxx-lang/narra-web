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
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          margin: 12,
          borderRadius: 14,
          padding: 4,
          border: "1px solid #243A6E",
          overflow: "hidden",
          background: "#fff",
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
            }}
          />
        )}
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
