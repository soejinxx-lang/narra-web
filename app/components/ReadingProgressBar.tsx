"use client";

import { useState, useEffect } from "react";

/**
 * ReadingProgressBar — Fixed thin bar at the very top of the viewport
 * Shows how much of the page the user has scrolled through.
 */
export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                setProgress(Math.min(100, Math.round((scrollTop / docHeight) * 100)));
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "3px",
                zIndex: 9999,
                background: "rgba(0,0,0,0.05)",
            }}
        >
            <div
                style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "0 2px 2px 0",
                    transition: "width 0.15s ease-out",
                }}
            />
        </div>
    );
}
