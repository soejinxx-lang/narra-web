import { fetchNovels } from "../lib/api";

export default async function Page() {
  const novels = await fetchNovels();

  return (
    <main style={{ padding: 24 }}>
      <h1>NARRA WEB</h1>
      <p>Storage connection test</p>

      <pre>
        {JSON.stringify(novels, null, 2)}
      </pre>
    </main>
  );
}
