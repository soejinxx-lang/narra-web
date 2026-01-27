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
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px 100px" }}>
      <h1
        style={{
          fontSize: "42px",
          fontWeight: 600,
          marginBottom: "60px",
          color: "#243A6E",
          fontFamily: '"KoPub Batang", serif',
          letterSpacing: "-0.5px",
        }}
      >
        FAQ & Support
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
        {/* For Readers */}
        <section>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#243A6E",
              marginBottom: "24px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            For Readers
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {readersQnA.map((item, index) => (
              <AccordionItem key={index} item={item} />
            ))}
          </div>
        </section>

        {/* For Creators */}
        <section>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#243A6E",
              marginBottom: "24px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            For Creators
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {creatorsQnA.map((item, index) => (
              <AccordionItem key={index} item={item} />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          style={{
            marginTop: "40px",
            borderTop: "1px solid #243A6E",
            paddingTop: "40px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#243A6E",
              marginBottom: "16px",
              fontFamily: '"KoPub Batang", serif',
            }}
          >
            Contact
          </h2>
          <p style={{ fontSize: "16px", color: "#444", lineHeight: 1.6, marginBottom: "16px" }}>
            Have a question or suggestion? Feel free to email us at any time.
          </p>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#333",
              fontFamily: "monospace",
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
        borderBottom: "1px solid #e5e5e5",
        backgroundColor: "transparent",
        transition: "all 0.3s ease",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "24px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",

        }}
      >
        <span
          style={{
            fontSize: "20px",
            fontWeight: 500,
            color: isHovered || isOpen ? "#243A6E" : "#171717",
            fontFamily: '"KoPub Batang", serif', // Use serif for questions
            transition: "color 0.2s",
          }}
        >
          Q. {item.question}
        </span>
        <span
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            color: isHovered || isOpen ? "#243A6E" : "#999",
            marginLeft: "24px",
            fontSize: "14px",
          }}
        >
          ▼
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? "500px" : "0",
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.25, 1, 0.5, 1), padding 0.3s",
        }}
      >
        <div
          style={{
            padding: "0 12px 32px 12px",
            color: "#444",
            fontSize: "16px",
            lineHeight: 1.8,
            whiteSpace: "pre-line",
          }}
        >
          {item.answer}
        </div>
      </div>
    </div>
  );
}
