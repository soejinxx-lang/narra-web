"use client";

import { useLocale } from "../../lib/i18n";

export default function PrivacyPage() {
    const { locale } = useLocale();
    const isKorean = locale === "ko";

    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 100px" }}>
            <h1
                style={{
                    fontSize: "36px",
                    fontWeight: 600,
                    marginBottom: "16px",
                    color: "#243A6E",
                    fontFamily: '"KoPub Batang", serif',
                }}
            >
                {isKorean ? "개인정보처리방침" : "Privacy Policy"}
            </h1>
            <p style={{ fontSize: "14px", color: "#999", marginBottom: "32px" }}>
                {isKorean ? "시행일: 2026년 3월 1일" : "Effective: March 1, 2026"}
            </p>

            {!isKorean && (
                <div
                    style={{
                        padding: "16px",
                        background: "#fff8e1",
                        borderLeft: "4px solid #f9a825",
                        marginBottom: "32px",
                        fontSize: "14px",
                        color: "#666",
                        lineHeight: 1.6,
                    }}
                >
                    ⚠️ This is a reference translation. The legally binding version is the Korean original.
                    In case of discrepancies, the Korean version prevails.
                </div>
            )}

            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "32px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    lineHeight: 1.8,
                    fontSize: "15px",
                    color: "#333",
                }}
            >
                <p style={{ marginBottom: "24px" }}>
                    {isKorean
                        ? "NARRA(이하 \"플랫폼\")는 「개인정보 보호법」 제30조에 따라 이용자의 개인정보를 보호하고 관련 고충을 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다."
                        : "NARRA (the \"Platform\") establishes and discloses this Privacy Policy in accordance with the Personal Information Protection Act to protect users' personal information."}
                </p>

                <Section title={isKorean ? "제1조 (수집하는 개인정보)" : "Article 1 (Information Collected)"}>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px" }}>{isKorean ? "필수 항목" : "Required"}</h4>
                    <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
                        <li>{isKorean ? "이메일 주소 (아이디)" : "Email address (username)"}</li>
                        <li>{isKorean ? "비밀번호 (암호화 저장)" : "Password (stored encrypted)"}</li>
                        <li>{isKorean ? "가입일시" : "Registration date"}</li>
                        <li>{isKorean ? "접속 IP 주소" : "IP address"}</li>
                    </ul>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px" }}>{isKorean ? "선택 항목" : "Optional"}</h4>
                    <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
                        <li>{isKorean ? "닉네임" : "Nickname"}</li>
                        <li>{isKorean ? "프로필 사진" : "Profile picture"}</li>
                    </ul>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px" }}>{isKorean ? "자동 수집" : "Automatically Collected"}</h4>
                    <ul style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "서비스 이용 기록, 접속 로그" : "Service usage logs, access logs"}</li>
                        <li>{isKorean ? "기기 정보 (OS, 브라우저)" : "Device information (OS, browser)"}</li>
                        <li>{isKorean ? "쿠키" : "Cookies"}</li>
                    </ul>
                </Section>

                <Section title={isKorean ? "제2조 (이용 목적)" : "Article 2 (Purpose of Use)"}>
                    <ul style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "회원 가입 및 관리" : "Member registration and management"}</li>
                        <li>{isKorean ? "서비스 제공 (콘텐츠, 맞춤 서비스)" : "Service provision (content, personalization)"}</li>
                        <li>{isKorean ? "서비스 부정이용 방지" : "Prevention of fraudulent use"}</li>
                        <li>{isKorean ? "통계 분석 및 서비스 개선" : "Statistical analysis and service improvement"}</li>
                    </ul>
                </Section>

                <Section title={isKorean ? "제3조 (보관 기간)" : "Article 3 (Retention Period)"}>
                    <ul style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "원칙: 회원 탈퇴 시까지" : "Principle: Until account deletion"}</li>
                        <li>{isKorean ? "전자상거래법에 따른 기록: 5년" : "E-commerce records: 5 years"}</li>
                        <li>{isKorean ? "통신비밀보호법에 따른 로그인 기록: 3개월" : "Login records per Communications Privacy Act: 3 months"}</li>
                    </ul>
                </Section>

                <Section title={isKorean ? "제4조 (제3자 제공)" : "Article 4 (Third-Party Disclosure)"}>
                    <p>{isKorean
                        ? "플랫폼은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 단, 이용자가 사전에 동의한 경우 또는 법령의 규정에 의한 경우는 예외입니다."
                        : "The Platform does not disclose personal information to third parties, except when the user has given prior consent or as required by law."}</p>
                </Section>

                <Section title={isKorean ? "제5조 (처리 위탁)" : "Article 5 (Processing Delegation)"}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginTop: "8px" }}>
                        <thead>
                            <tr style={{ background: "#f5f5f5" }}>
                                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>{isKorean ? "수탁업체" : "Company"}</th>
                                <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ddd" }}>{isKorean ? "위탁업무" : "Purpose"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Railway</td><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{isKorean ? "서버 호스팅" : "Server hosting"}</td></tr>
                            <tr><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Vercel</td><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{isKorean ? "웹 호스팅" : "Web hosting"}</td></tr>
                            <tr><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>OpenAI / Azure</td><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{isKorean ? "번역 서비스" : "Translation service"}</td></tr>
                            <tr><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>Google</td><td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{isKorean ? "통계 분석 (Analytics)" : "Analytics"}</td></tr>
                        </tbody>
                    </table>
                </Section>

                <Section title={isKorean ? "제6조 (이용자의 권리)" : "Article 6 (User Rights)"}>
                    <p>{isKorean ? "이용자는 다음의 권리를 행사할 수 있습니다:" : "Users may exercise the following rights:"}</p>
                    <ul style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "개인정보 열람 요구" : "Request access to personal information"}</li>
                        <li>{isKorean ? "오류 정정 요구" : "Request correction of errors"}</li>
                        <li>{isKorean ? "삭제 요구" : "Request deletion"}</li>
                        <li>{isKorean ? "처리 정지 요구" : "Request suspension of processing"}</li>
                    </ul>
                    <p style={{ marginTop: "8px" }}>{isKorean ? "문의: contact@narra.kr" : "Contact: contact@narra.kr"}</p>
                </Section>

                <Section title={isKorean ? "제7조 (쿠키)" : "Article 7 (Cookies)"}>
                    <p>{isKorean
                        ? "플랫폼은 로그인 상태 유지 및 서비스 이용 통계 분석을 위해 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키를 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다."
                        : "The Platform uses cookies for login session maintenance and usage analytics. You may refuse cookies through browser settings, but some services may be limited."}</p>
                </Section>

                <Section title={isKorean ? "제8조 (안전성 확보 조치)" : "Article 8 (Security Measures)"}>
                    <ul style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "비밀번호 해시화 (bcrypt)" : "Password hashing (bcrypt)"}</li>
                        <li>{isKorean ? "HTTPS 암호화 통신" : "HTTPS encrypted communication"}</li>
                        <li>{isKorean ? "접속 기록 보관 및 위변조 방지" : "Access log retention and tamper prevention"}</li>
                        <li>{isKorean ? "Rate Limiting (요청 제한)" : "Rate limiting"}</li>
                    </ul>
                </Section>

                <Section title={isKorean ? "제9조 (개인정보 보호책임자)" : "Article 9 (Privacy Officer)"}>
                    <p>{isKorean ? "이메일: contact@narra.kr" : "Email: contact@narra.kr"}</p>
                </Section>

                <div style={{ marginTop: "32px", padding: "16px", background: "#f5f5f5", borderRadius: "8px", fontSize: "13px", color: "#888" }}>
                    {isKorean ? "본 방침은 2026년 3월 1일부터 시행됩니다." : "This Policy is effective as of March 1, 2026."}
                </div>
            </div>
        </main>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "28px" }}>
            <h3
                style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#243A6E",
                    marginBottom: "12px",
                    fontFamily: '"KoPub Batang", serif',
                }}
            >
                {title}
            </h3>
            <div style={{ color: "#444", lineHeight: 1.8 }}>{children}</div>
        </div>
    );
}
