"use client";

import { useState } from "react";

type QnAItem = {
    question: string;
    answer: string;
};

export default function AccordionItem({ item }: { item: QnAItem }) {
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
                        fontFamily: '"KoPub Batang", serif',
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

export type { QnAItem };
