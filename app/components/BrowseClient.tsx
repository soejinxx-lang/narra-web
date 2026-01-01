"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import NovelCard from "./NovelCard";
import BrowseFilters from "./BrowseFilters";

type BrowseClientProps = {
  novels: any[];
  initialQuery?: string;
};

export default function BrowseClient({ novels, initialQuery = "" }: BrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("latest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 모든 태그 추출 (실제로는 API에서 가져올 수 있음)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    novels.forEach((novel: any) => {
      if (novel.tags && Array.isArray(novel.tags)) {
        novel.tags.forEach((tag: string) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [novels]);

  const filteredAndSortedNovels = useMemo(() => {
    let filtered = novels;

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (novel: any) =>
          novel.title?.toLowerCase().includes(query) ||
          novel.description?.toLowerCase().includes(query) ||
          novel.author?.toLowerCase().includes(query)
      );
    }

    // 태그 필터
    if (selectedTags.length > 0) {
      filtered = filtered.filter((novel: any) => {
        const novelTags = novel.tags || [];
        return selectedTags.some((tag) => novelTags.includes(tag));
      });
    }

    // 정렬
    const sorted = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case "popular":
          // 인기도 정렬 (임시로 ID 기반)
          return Number(b.id.replace("novel-", "")) - Number(a.id.replace("novel-", ""));
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "latest":
        default:
          return Number(b.id.replace("novel-", "")) - Number(a.id.replace("novel-", ""));
      }
    });

    return sorted;
  }, [novels, searchQuery, selectedTags, sortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "32px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        Browse Novels
      </h1>

      {/* 검색바 */}
      <div style={{ marginBottom: "24px" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, or content..."
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "12px 16px",
            border: "2px solid #e5e5e5",
            borderRadius: "8px",
            fontSize: "15px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#243A6E";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e5e5";
          }}
        />
      </div>

      {/* 필터 */}
      <BrowseFilters
        sortBy={sortBy}
        onSortChange={setSortBy}
        tags={allTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />

      {/* 결과 수 */}
      <div style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
        {filteredAndSortedNovels.length} novels found
      </div>

      {/* 소설 그리드 */}
      {filteredAndSortedNovels.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#999",
            fontSize: "16px",
          }}
        >
          No results found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredAndSortedNovels.map((novel: any) => (
            <Link
              key={novel.id}
              href={`/novels/${novel.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <NovelCard novel={novel} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

