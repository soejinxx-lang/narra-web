"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * ?ref= 파라미터 추적 (Google Analytics 이벤트로 전송)
 *
 * 사용법: layout.tsx의 <Providers> 안에 <RefTracker /> 추가
 *
 * 링크 예시:
 *   https://www.narra.kr?ref=reddit
 *   https://www.narra.kr/novels/xxx/episodes/1?ref=scribblehub
 */
export default function RefTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (!ref) return;

        // GA4 이벤트 전송
        if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "referral_visit", {
                ref_source: ref,
                landing_page: window.location.pathname,
            });
        }

        // localStorage에 첫 방문 ref 저장 (전환 추적용)
        if (!localStorage.getItem("narra_ref")) {
            localStorage.setItem("narra_ref", ref);
            localStorage.setItem("narra_ref_time", new Date().toISOString());
        }
    }, [searchParams]);

    return null;
}
