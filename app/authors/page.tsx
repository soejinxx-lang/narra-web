import { fetchNovels } from "@/lib/api";
import AuthorCard from "@/app/components/AuthorCard";

export default async function AuthorsPage() {
  const novels = await fetchNovels();

  // Extract unique authors from novels
  const authorsMap = new Map<string, { name: string; novelCount: number; novels: any[] }>();
  
  novels.forEach((novel: any) => {
    const authorName = novel.author || "Unknown Author";
    if (authorsMap.has(authorName)) {
      const author = authorsMap.get(authorName)!;
      author.novelCount++;
      author.novels.push(novel);
    } else {
      authorsMap.set(authorName, {
        name: authorName,
        novelCount: 1,
        novels: [novel],
      });
    }
  });

  const authors = Array.from(authorsMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

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
          {authors.map((author) => (
            <AuthorCard key={author.name} author={author} />
          ))}
        </div>
      )}
    </main>
  );
}

