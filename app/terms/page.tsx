import { cookies } from "next/headers";
import type { Locale } from "../../lib/i18n";
import { getTermsTranslations } from "./translations";

const VALID_LOCALES: Locale[] = ["ko", "en", "ja", "zh", "es", "fr", "de", "pt", "id"];

export default async function TermsPage() {
    const cookieStore = await cookies();
    const saved = cookieStore.get("narra-locale")?.value as Locale | undefined;
    const locale: Locale = saved && VALID_LOCALES.includes(saved) ? saved : "en";
    const t = getTermsTranslations(locale);

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
                {t.title}
            </h1>
            <p style={{ fontSize: "14px", color: "#999", marginBottom: "32px" }}>
                {t.effective}
            </p>

            {locale !== "ko" && (
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
                    {t.translationNotice}
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
                <Section title={t.a1.title}>{t.a1.body}</Section>

                <Section title={t.a2.title}>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a2.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                </Section>

                <Section title={t.a3.title}>{t.a3.body}</Section>

                <Section title={t.a4.title}>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px" }}>{t.a4.s1.title}</h4>
                    <p>{t.a4.s1.body}</p>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px", marginTop: "16px" }}>{t.a4.s2.title}</h4>
                    <p>{t.a4.s2.body}</p>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px", marginTop: "16px" }}>{t.a4.s3.title}</h4>
                    <p>{t.a4.s3.body}</p>
                </Section>

                <Section title={t.a5.title}>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a5.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                </Section>

                <Section title={t.a6.title}>
                    <p>{t.a6.intro}</p>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a6.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                </Section>

                <Section title={t.a7.title}>
                    <p>{t.a7.intro}</p>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a7.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                    <p style={{ marginTop: "12px" }}>{t.a7.warning}</p>
                </Section>

                <Section title={t.a8.title}>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a8.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                </Section>

                <Section title={t.a9.title}>{t.a9.body}</Section>

                <Section title={t.a10.title}>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a10.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                </Section>

                <Section title={t.a11.title}>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a11.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                </Section>

                <Section title={t.a12.title}>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px" }}>{t.a12.s1.title}</h4>
                    <p>{t.a12.s1.body}</p>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px", marginTop: "16px" }}>{t.a12.s2.title}</h4>
                    <p>{t.a12.s2.body}</p>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px", marginTop: "16px" }}>{t.a12.s3.title}</h4>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a12.s3.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px", marginTop: "16px" }}>{t.a12.s4.title}</h4>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a12.s4.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                    <h4 style={{ color: "#243A6E", marginBottom: "8px", marginTop: "16px" }}>{t.a12.s5.title}</h4>
                    <p>{t.a12.s5.body}</p>
                </Section>

                <Section title={t.a13.title}>
                    <ol style={{ paddingLeft: "20px" }}>
                        {t.a13.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                    </ol>
                </Section>

                <div style={{ marginTop: "32px", padding: "16px", background: "#f5f5f5", borderRadius: "8px", fontSize: "13px", color: "#888" }}>
                    {t.footer}
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
