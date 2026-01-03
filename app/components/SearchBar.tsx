"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/browse`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        flex: 1,
        maxWidth: "400px",
        position: "relative",
        margin: "0 16px",
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search novels..."
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid #e5e5e5",
          borderRadius: "20px",
          fontSize: "14px",
          outline: "none",
          background: "#fff",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#243A6E";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e5e5e5";
        }}
      />
    </form>
  );
}
