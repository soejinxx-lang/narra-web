import styles from "./NovelCard.module.css";

type NovelCardProps = {
  novel: any;
};

export default function NovelCard({ novel }: NovelCardProps) {
  return (
    <div
      className={styles.novelCard}
      style={{
        width: "100%",
        margin: 0,
        aspectRatio: "5 / 9.5",
        border: "1px solid #e5e5e5",
        borderRadius: 16,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* 남색 패널 */}
      <div
        style={{
          aspectRatio: "2 / 3",
          background: "#243A6E",
          padding: 6,
          overflow: "hidden",
          flexShrink: 0,
          borderRadius: 14,
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
              border: "0.1cm solid #ffffff",
            }}
          />
        )}
      </div>

      {/* 제목 영역 */}
      <div
        style={{
          padding: "8px 12px 6px",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
          color: "#222",
          flexGrow: 1,
          maxHeight: "60px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minHeight: 0,
        }}
      >
        <div style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          wordBreak: "break-word",
        }}>
          {novel.title}
        </div>
      </div>
    </div>
  );
}
