import { fetchAuthors } from "@/lib/api";
import AuthorCard from "@/app/components/AuthorCard";

export default async function AuthorsPage() {
  const authors = await fetchAuthors();

  return (
    <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: "#243A6E",
            fontFamily: '"KoPub Batang", serif',
          }}
        >
          Authors
        </h1>
        <p style={{ fontSize: "13px", color: "#999", fontStyle: "italic" }}>
          Want your novel translated? Reach out at{" "}
          <a href="mailto:contact@narra.kr" style={{ color: "#243A6E", textDecoration: "underline" }}>
            contact@narra.kr
          </a>
        </p>
      </div>

      {authors.length === 0 ? (
        <div style={{ color: "#999", textAlign: "center", padding: "40px" }}>
          No authors found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {authors.map((author: any) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      )}
    </main>
  );
}
