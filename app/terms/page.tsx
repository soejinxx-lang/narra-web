"use client";

import { useLocale } from "../../lib/i18n";

export default function TermsPage() {
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
                {isKorean ? "이용약관" : "Terms of Service"}
            </h1>
            <p style={{ fontSize: "14px", color: "#999", marginBottom: "32px" }}>
                {isKorean ? "시행일: 2026년 3월 1일 (v1.0)" : "Effective: March 1, 2026 (v1.0)"}
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
                <Section title={isKorean ? "제1조 (목적)" : "Article 1 (Purpose)"}>
                    {isKorean
                        ? "본 약관은 NARRA(이하 \"플랫폼\")가 제공하는 웹소설 서비스(이하 \"서비스\")의 이용과 관련하여 플랫폼과 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다."
                        : "These Terms of Service govern the rights, obligations, and responsibilities between NARRA (the \"Platform\") and users regarding the use of the web novel service (the \"Service\")."}
                </Section>

                <Section title={isKorean ? "제2조 (정의)" : "Article 2 (Definitions)"}>
                    <ol style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "\"플랫폼\"이란 NARRA 웹사이트 및 관련 서비스를 의미합니다." : "\"Platform\" refers to the NARRA website and all related services."}</li>
                        <li>{isKorean ? "\"콘텐츠\"란 소설 원문 및 번역물을 포함한 모든 창작물을 의미합니다." : "\"Content\" refers to all creative works including original texts and translations."}</li>
                        <li>{isKorean ? "\"작가\"란 콘텐츠를 업로드한 회원을 의미합니다." : "\"Author\" refers to a member who uploads Content."}</li>
                        <li>{isKorean ? "\"독자\"란 콘텐츠를 열람하는 회원을 의미합니다." : "\"Reader\" refers to a member who reads Content."}</li>
                        <li>{isKorean ? "\"회원\"이란 플랫폼에 가입하여 서비스를 이용하는 자를 의미합니다." : "\"Member\" refers to a person who has registered and uses the Service."}</li>
                    </ol>
                </Section>

                <Section title={isKorean ? "제3조 (약관의 게시 및 개정)" : "Article 3 (Amendment)"}>
                    {isKorean
                        ? "플랫폼은 필요 시 본 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정 사유를 명시하여 최소 7일 전에 공지합니다. 회원이 개정 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다."
                        : "The Platform may amend these Terms as necessary and will provide at least 7 days' prior notice specifying the effective date and reasons for the amendment. Members who do not agree to the amended Terms may discontinue use and withdraw."}
                </Section>

                <Section title={isKorean ? "제4조 (저작권 및 권리 귀속)" : "Article 4 (Copyright and Rights)"}>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px" }}>{isKorean ? "4.1 원문 저작권" : "4.1 Original Works"}</h4>
                    <p>{isKorean
                        ? "작가가 업로드한 원문의 저작권은 작가에게 귀속됩니다. 단, 작가는 플랫폼에 다음 권리를 비독점적으로 허락합니다: 전송권(웹사이트 게시), 번역권(9개 언어 자동 번역), 2차 저작물 작성권, 서비스 홍보를 위한 사용."
                        : "Copyright of original works uploaded by Authors belongs to the Author. However, the Author grants the Platform a non-exclusive license to: display on the website, translate into 9 languages, create derivative works, and use for service promotion."}</p>

                    <h4 style={{ color: "#243A6E", marginBottom: "8px", marginTop: "16px" }}>{isKorean ? "4.2 번역물 저작권" : "4.2 Translations"}</h4>
                    <p>{isKorean
                        ? "플랫폼이 제공하는 자동 번역 콘텐츠의 저작권은 플랫폼에 귀속됩니다. 번역물은 AI 기술을 활용하여 생성되며, 참고용으로 제공됩니다. 플랫폼은 번역의 정확성이나 완전성을 보장하지 않습니다."
                        : "Copyright of auto-translated content belongs to the Platform. Translations are generated using AI technology and provided for reference only. The Platform does not guarantee translation accuracy or completeness."}</p>

                    <h4 style={{ color: "#243A6E", marginBottom: "8px", marginTop: "16px" }}>{isKorean ? "4.3 데이터베이스권" : "4.3 Database Rights"}</h4>
                    <p>{isKorean
                        ? "본 플랫폼의 다국어 번역 데이터베이스는 상당한 투자와 노력의 산물로서 저작권법 제93조에 따른 데이터베이스 제작자의 권리로 보호됩니다."
                        : "The Platform's multilingual translation database is protected as a substantial investment under database producer rights (Korean Copyright Act, Article 93)."}</p>
                </Section>

                <Section title={isKorean ? "제5조 (AI 기술 활용)" : "Article 5 (Use of AI Technology)"}>
                    <ol style={{ paddingLeft: "20px" }}>
                        <li>{isKorean
                            ? "본 플랫폼은 자동 번역, 콘텐츠 추천, 검색 최적화, 서비스 개선 영역에서 AI 기술을 활용합니다."
                            : "The Platform uses AI technology for automatic translation, content recommendation, search optimization, and service improvement."}</li>
                        <li>{isKorean
                            ? "작가는 창작 과정에서 AI 도구를 보조적으로 사용할 수 있습니다. 단, 최종 콘텐츠에 대한 저작권 및 법적 책임은 작가에게 있습니다."
                            : "Authors may use AI tools as assistants in the creative process. However, copyright and legal responsibility for the final content rests with the Author."}</li>
                        <li>{isKorean
                            ? "일부 콘텐츠는 작가가 AI 도구를 활용하여 제작했을 수 있습니다. 플랫폼은 AI 사용 여부를 검증하지 않습니다."
                            : "Some content may have been created with AI tools. The Platform does not verify AI usage."}</li>
                    </ol>
                </Section>

                <Section title={isKorean ? "제6조 (작가의 보증 및 책임)" : "Article 6 (Author Warranties)"}>
                    <p>{isKorean ? "작가는 다음을 보증합니다:" : "Authors warrant that:"}</p>
                    <ol style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "업로드한 콘텐츠가 자신의 창작물이거나 적법한 권리를 보유하고 있음" : "Uploaded content is their own creation or they hold lawful rights to it"}</li>
                        <li>{isKorean ? "콘텐츠가 제3자의 저작권, 상표권, 초상권, 명예권 등을 침해하지 않음" : "Content does not infringe on any third-party intellectual property rights"}</li>
                        <li>{isKorean ? "콘텐츠가 관련 법령 및 플랫폼 정책을 위반하지 않음" : "Content complies with applicable laws and Platform policies"}</li>
                        <li>{isKorean ? "위 보증이 거짓일 경우 발생하는 모든 법적 책임은 작가가 부담함" : "The Author bears all legal liability if the above warranties are false"}</li>
                    </ol>
                </Section>

                <Section title={isKorean ? "제7조 (이용 제한)" : "Article 7 (Usage Restrictions)"}>
                    <p>{isKorean ? "다음 행위는 엄격히 금지됩니다:" : "The following are strictly prohibited:"}</p>
                    <ol style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "콘텐츠의 복제, 전송, 배포, 출판" : "Copying, transmitting, distributing, or publishing Content"}</li>
                        <li>{isKorean ? "번역물의 무단 사용 및 재배포" : "Unauthorized use or redistribution of translations"}</li>
                        <li>{isKorean ? "크롤링, 스크래핑, 자동화 도구를 이용한 수집" : "Crawling, scraping, or automated data collection"}</li>
                        <li>{isKorean ? "콘텐츠의 상업적 이용" : "Commercial use of Content"}</li>
                        <li>{isKorean ? "저작권 표시 제거 또는 변경" : "Removing or altering copyright notices"}</li>
                    </ol>
                    <p style={{ marginTop: "12px" }}>{isKorean
                        ? "위반 시 즉시 계정 정지, 법적 조치 및 손해배상이 청구될 수 있습니다."
                        : "Violations may result in immediate account suspension, legal action, and claims for damages."}</p>
                </Section>

                <Section title={isKorean ? "제8조 (면책 사항)" : "Article 8 (Disclaimers)"}>
                    <ol style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "플랫폼은 작가가 업로드한 콘텐츠의 정확성, 적법성, 품질에 대해 책임지지 않습니다." : "The Platform is not responsible for the accuracy, legality, or quality of Author-uploaded content."}</li>
                        <li>{isKorean ? "자동 번역의 정확성, 완전성, 적시성을 보장하지 않습니다." : "The Platform does not guarantee translation accuracy, completeness, or timeliness."}</li>
                        <li>{isKorean ? "시스템 점검, 천재지변, 제3자 서비스 장애 등으로 서비스가 중단될 수 있습니다." : "Service may be interrupted due to maintenance, force majeure, or third-party service failures."}</li>
                    </ol>
                </Section>

                <Section title={isKorean ? "제9조 (저작권 침해 신고)" : "Article 9 (Copyright Infringement Reports)"}>
                    <p>{isKorean
                        ? "저작권 침해를 발견한 권리자는 권리자 정보, 침해 콘텐츠 URL, 원본 저작물 정보, 침해 사실 증명 자료를 포함하여 contact@narra.kr로 신고할 수 있습니다. 접수 시 해당 콘텐츠를 임시 비공개 처리하고 작가에게 통지합니다."
                        : "Rights holders who discover copyright infringement may report to contact@narra.kr with: rights holder information, infringing content URL, original work details, and proof of infringement. Upon receipt, the content will be temporarily hidden and the Author notified."}</p>
                </Section>

                <Section title={isKorean ? "제10조 (서비스 요금)" : "Article 10 (Service Fees)"}>
                    <ol style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "NARRA는 현재 베타 서비스로 운영되며, 대부분의 기능을 무료로 제공합니다." : "NARRA currently operates as a beta service and provides most features free of charge."}</li>
                        <li>{isKorean ? "정식 서비스 전환 시 일부 기능이 유료로 전환될 수 있으며, 최소 30일 전에 공지합니다." : "Some features may become paid upon full launch, with at least 30 days' prior notice."}</li>
                        <li>{isKorean ? "베타 기간 가입자에게는 우대 혜택을 제공할 수 있습니다." : "Beta users may receive preferential benefits."}</li>
                    </ol>
                </Section>

                <Section title={isKorean ? "제11조 (분쟁 해결)" : "Article 11 (Dispute Resolution)"}>
                    <ol style={{ paddingLeft: "20px" }}>
                        <li>{isKorean ? "본 약관은 대한민국 법률에 따라 해석됩니다." : "These Terms are governed by the laws of the Republic of Korea."}</li>
                        <li>{isKorean ? "서비스 이용과 관련한 분쟁은 상호 협의하여 해결합니다." : "Disputes shall be resolved through mutual consultation."}</li>
                        <li>{isKorean ? "협의가 이루어지지 않을 경우 서울중앙지방법원을 제1심 관할법원으로 합니다." : "If consultation fails, the Seoul Central District Court shall have jurisdiction."}</li>
                    </ol>
                </Section>

                <div style={{ marginTop: "32px", padding: "16px", background: "#f5f5f5", borderRadius: "8px", fontSize: "13px", color: "#888" }}>
                    {isKorean
                        ? "본 약관은 본 사이트를 이용하시는 모든 사용자에게 적용됩니다. 사이트 이용 시 본 약관에 동의하는 것으로 간주됩니다."
                        : "These Terms apply to all users of this site. By using the site, you are deemed to have agreed to these Terms."}
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
