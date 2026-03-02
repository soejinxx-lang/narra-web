"use client";

import { useState } from "react";
import { useLocale } from "../../lib/i18n";

type QnAItem = {
  question: string;
  answer: string;
};

export default function SupportPage() {
  const { t } = useLocale();
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
    {
      question: "What is the AI Badge?",
      answer: "This badge is displayed on novels that utilize AI technology in their creation process. We believe in transparency and want you to know exactly how the stories you enjoy are made.",
    },
  ];

  const creatorsQnA: QnAItem[] = [
    {
      question: "Can I publish my novel on NARRA?",
      answer: "Go for it. You focus on the storytelling; we'll break down the language walls for you. Your work gets translated into English, Spanish, Japanese, and more—so readers worldwide can find you.",
    },
    {
      question: "What about revenue?",
      answer: "To be real: if you're looking for a quick payout, we might not be there yet. But if you want to see your story go global and test how it resonates with readers in 9 different languages, that's exactly what we're building. Our current authors are here for the long game.",
    },
    {
      question: "What about copyright?",
      answer: "You retain full copyright of your original work—always. NARRA never claims ownership of your story. By publishing on NARRA, you grant us a non-exclusive license to translate and distribute your work globally. \"Non-exclusive\" means you are free to publish the same original work on any other platform simultaneously (Wattpad, Kakao, Munpia, etc.). We do not lock you in.",
    },
    {
      question: "Who owns the translated text?",
      answer: "The translated versions are created by NARRA at our own cost using our proprietary translation pipeline. The exclusive right to use, distribute, and display these translations belongs to NARRA.\n\nTo be clear:\n• Your original work = yours. Publish it anywhere.\n• NARRA's translations = NARRA's. You may not copy or redistribute them to other platforms.\n\nWe're following the same rules as the big guys like Webnovel or Tapas. We invest in translating your story into 9 languages—in return, those translations stay on NARRA.",
    },
    {
      question: "Is copyright protection better than other sites?",
      answer: "Honestly? No platform can stop every scraper. But here's what we do: NoAI tags block corporate crawlers, and when someone copies text, our source URL gets embedded automatically. If your work shows up elsewhere, you'll have proof it came from NARRA. We protect you through policy, not just code.",
    },
    {
      question: "Can I remove my work from NARRA?",
      answer: "Yes. You can request removal at any time by contacting us. When your original work is removed, all associated translations are also deleted from our platform.",
    },
    {
      question: "Why 9 languages? Google Translate exists.",
      answer: "I'm a web novel reader myself. Generic translators miss the nuances—they don't get genre fiction. The way a romance builds tension, or how a fantasy world feels real... that's lost when you just run it through Google Translate. NARRA locks character names, preserves tone, and keeps stories feeling like stories.",
    },
    {
      question: "What's NARRA's goal?",
      answer: "Great stories shouldn't die in their home country just because of language. I'm not backed by big money, but I built NARRA to solve a real problem: connecting authors with readers across borders. My goal is to be the most reliable partner for writers going global—not through capital, but through sharp tech.",
    },
    {
      question: "Who runs NARRA?",
      answer: "Just me—a college engineering student in Korea who reads way too many web novels.",
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
        {t("support.title")}
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
            {t("support.forReaders")}
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
            {t("support.forCreators")}
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
            {t("support.contact")}
          </h2>
          <p style={{ fontSize: "16px", color: "#444", lineHeight: 1.6, marginBottom: "16px" }}>
            {t("support.contactDesc")}
          </p>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#333",
              fontFamily: "monospace",
            }}
          >
            contact@narra.kr
          </div>
        </section>

        {/* Legal */}
        <section
          style={{
            borderTop: "1px solid #e5e5e5",
            paddingTop: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#243A6E",
              marginBottom: "16px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            {t("support.legal")}
          </h2>
          <div
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/terms"
              style={{
                color: "#243A6E",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 500,
                borderBottom: "1px solid transparent",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = "#243A6E")}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
            >
              Terms of Service →
            </a>
            <a
              href="/privacy"
              style={{
                color: "#243A6E",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: 500,
                borderBottom: "1px solid transparent",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = "#243A6E")}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
            >
              Privacy Policy →
            </a>
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
          maxHeight: isOpen ? "800px" : "0",
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
