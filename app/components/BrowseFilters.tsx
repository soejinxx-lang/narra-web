"use client";

type BrowseFiltersProps = {
  sortBy: string;
  onSortChange: (sort: string) => void;
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
};

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "title", label: "Title" },
];

export default function BrowseFilters({
  sortBy,
  onSortChange,
  tags,
  selectedTags,
  onTagToggle,
}: BrowseFiltersProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#243A6E",
          }}
        >
          Sort By
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              style={{
                padding: "8px 16px",
                border: `2px solid ${sortBy === option.value ? "#243A6E" : "#e5e5e5"}`,
                borderRadius: "20px",
                background: sortBy === option.value ? "#243A6E" : "#fff",
                color: sortBy === option.value ? "#fff" : "#333",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#243A6E",
            }}
          >
            Filter by Tags
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                style={{
                  padding: "6px 14px",
                  border: `1px solid ${selectedTags.includes(tag) ? "#243A6E" : "#e5e5e5"}`,
                  borderRadius: "16px",
                  background: selectedTags.includes(tag) ? "#e8ecf5" : "#fff",
                  color: selectedTags.includes(tag) ? "#243A6E" : "#666",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

