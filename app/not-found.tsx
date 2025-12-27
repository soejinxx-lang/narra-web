export default function NotFound() {
  return (
    <main style={{ padding: 48, textAlign: "center" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>
        페이지를 찾을 수 없습니다
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        존재하지 않거나 삭제된 콘텐츠입니다.
      </p>
      <a href="/novels" style={{ color: "#111", fontWeight: 600 }}>
        전체 작품 목록으로 돌아가기
      </a>
    </main>
  );
}
