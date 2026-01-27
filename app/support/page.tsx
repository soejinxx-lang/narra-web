"use client";

import { useState } from "react";

type QnAItem = {
  question: string;
  answer: string;
};

export default function SupportPage() {
  const readersQnA: QnAItem[] = [
    {
      question: "What is NARRA?",
      answer: "NARRA is a global platform where you can enjoy web novels from around the world without language barriers. Starting with popular Korean novels, we share stories from diverse cultures in languages that feel natural to you.",
    },
    {
      question: "What is the Original Badge?",
      answer: "This badge indicates works serialized exclusively on NARRA. These stories are unique to our platform and cannot be found anywhere else.",
    },
    {
      question: "How is the translation quality?",
      answer: "While we use top-tier technology, the final touch is human. We manually extract and lock proper nouns (names, places, skills, etc.) for every series. This ensures character names and terms remain consistent throughout long stories, allowing you to stay fully immersed.",
    },
    {
      question: "Is it free?",
      answer: "Yes. During this beta period, all episodes are free to read.",
    },
  ];

  const creatorsQnA: QnAItem[] = [
    {
      question: "Can I publish my novel on NARRA?",
      answer: "Absolutely. We handle the language barrier so you can focus on writing great stories. With NARRA, your work can be translated into English, Spanish, Japanese, and more to reach readers worldwide.",
    },
    {
      question: "What about revenue?",
      answer: "Our current authors value the opportunity to see how their stories resonate with global readers over immediate short-term profits. We partner with creators who prioritize long-term potential and the experimental value of reaching a new, international audience, even if their work isn't widely known yet.",
    },
    {
      question: "What about copyright?",
      answer: "You retain full copyright of your work. Translations are used solely to share your story without infringing on your rights. We do not require exclusive contracts or rights transfers at this stage. Future monetization terms will only be negotiated when a revenue structure is established.",
    },
  ];

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
      <h1
        style={{
          fontSize: "36px",
          fontWeight: 600,
          marginBottom: "48px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
        }}
      >
        FAQ & Support
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
        {/* For Readers */}
        <section>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#333",
              marginBottom: "24px",
              borderBottom: "2px solid #243A6E",
              paddingBottom: "12px",
            }}
          >
            For Readers
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {readersQnA.map((item, index) => (
              <AccordionItem key={index} item={item} />
            ))}
          </div>
        </section>

        {/* For Creators */}
        <section>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#333",
              marginBottom: "24px",
              borderBottom: "2px solid #243A6E",
              paddingBottom: "12px",
            }}
          >
            For Creators
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {creatorsQnA.map((item, index) => (
              <AccordionItem key={index} item={item} />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          style={{
            marginTop: "20px",
            padding: "32px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "1px solid #eee",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#243A6E",
              marginBottom: "16px",
            }}
          >
            Contact
          </h2>
          <p style={{ fontSize: "16px", color: "#444", lineHeight: 1.6, marginBottom: "24px" }}>
            Have a question or suggestion? Feel free to email us at any time.
          </p>
          <div
            style={{
              display: "inline-block",
              padding: "12px 20px",
              backgroundColor: "#f5f7fa",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 500,
              color: "#333",
              border: "1px solid #e1e4e8",
            }}
          >
            narrastudio901@gmail.com
          </div>
        </section>
      </div>
    </main>
  );
}

function AccordionItem({ item }: { item: QnAItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        backgroundColor: "#fff",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered || isOpen
          ? "0 4px 12px rgba(0,0,0,0.08)"
          : "none",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "20px 24px",
          background: "none",
          border: "none",
          fontSize: "17px",
          fontWeight: 500,
          color: "#333",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          lineHeight: 1.5,
        }}
      >
        <span>Q. {item.question}</span>
        <span
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            color: "#888",
            marginLeft: "16px",
            fontSize: "14px",
          }}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            padding: "0 24px 24px 24px",
            color: "#555",
            fontSize: "16px",
            lineHeight: 1.7,
            whiteSpace: "pre-line",
          }}
        >
          {item.answer}
        </div>
      )}
    </div>
  );
}
