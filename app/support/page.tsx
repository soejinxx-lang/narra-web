"use client";

import { useState } from "react";

type QnAItem = {
  question: string;
  answer: string;
};

export default function SupportPage() {
  const readersQnA: QnAItem[] = [
    {
      question: "NARRA는 어떤 곳인가요?",
      answer: "NARRA는 언어의 장벽 없이 전 세계의 웹소설을 즐길 수 있는 글로벌 플랫폼입니다. 한국의 인기 웹소설을 시작으로, 다양한 문화권의 이야기를 가장 편안한 언어로 전달합니다.",
    },
    {
      question: "오리지널 배지는 뭔가요?",
      answer: "다른 플랫폼에서는 연재되지 않고, 오직 NARRA에서만 독점적으로 연재되는 작품에 부여되는 표시입니다. 이 배지가 붙은 작품은 어디서도 본 적 없는 새롭고 특별한 이야기들을 담고 있습니다.",
    },
    {
      question: "번역 퀄리티는 어떤가요?",
      answer: "최고의 기술을 활용하되, 결국 완성하는 것은 사람입니다. 저희는 작품 속 고유명사(이름, 지역, 기술명 등)를 사람이 직접 추출하고 고정하는 과정을 거칩니다. 덕분에 장편 연재가 이어져도 주인공 이름이 바뀌거나 엉뚱하게 번역되는 일 없이, 끝까지 몰입해서 읽으실 수 있습니다.",
    },
    {
      question: "이용료는 무료인가요?",
      answer: "현재 베타 서비스 기간 동안은 모든 에피소드를 무료로 감상하실 수 있습니다.",
    },
  ];

  const creatorsQnA: QnAItem[] = [
    {
      question: "제가 쓴 소설도 NARRA에서 연재할 수 있나요?",
      answer: "물론입니다. 언어 문제는 저희가 해결해 드립니다. 작가님은 오직 재미있는 이야기를 쓰는 데만 집중해 주세요. 내 작품이 영어, 스페인어, 일본어 등 다양한 언어로 번역되어 전 세계 독자들을 만나는 경험, NARRA와 함께라면 가능합니다.",
    },
    {
      question: "수익적인 부분은 어떤가요?",
      answer: "현재 참여하고 계신 작가님들은 단기적인 수익보다는, 내 작품이 다른 언어권 독자들에게 어떻게 읽히는지, 그리고 번역된 형태로 어떤 반응이 나오는지를 확인해 보고 싶다는 점을 가장 큰 메리트로 꼽으셨습니다. 아직 널리 알려지지 않은 작품이라도, 글로벌 시장에서의 장기적인 가능성과 실험적인 의미를 더 중요하게 생각하시는 분들과 함께하고 있습니다.",
    },
    {
      question: "저작권 문제는 어떻게 되나요?",
      answer: "작품의 저작권은 전적으로 작가님께 있으며, 번역본 역시 원작자의 권리를 침해하지 않는 범위 내에서만 사용됩니다. 현재 단계에서는 독점 계약이나 권리 양도 같은 것을 전제로 하지 않고, 이후 수익화가 가능한 구조가 만들어질 경우에만 그 시점에서 다시 조건을 협의하는 방향을 생각하고 있습니다.",
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
            문의사항이 있으신가요? 아래 이메일로 언제든 연락해 주세요.
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

  return (
    <div
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        backgroundColor: "#fff",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        boxShadow: isOpen ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
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
            whiteSpace: "pre-line", // 줄바꿈 지원
          }}
        >
          {item.answer}
        </div>
      )}
    </div>
  );
}
