import { fetchAuthors } from "@/lib/api";
import AuthorCard from "@/app/components/AuthorCard";

export default async function AuthorsPage() {
  const authors = await fetchAuthors();

  return (
    <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "32px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        Authors
      </h1>

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
