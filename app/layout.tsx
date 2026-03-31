import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import MusicPlayer from "./components/MusicPlayer";
import BottomBar from "./components/BottomBar";
import Providers from "./components/Providers";
import RefTracker from "./components/RefTracker";
import { getDictionary } from "../lib/i18n/getDictionary";
import type { Locale } from "../lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.narra.kr"),
  title: {
    default: "NARRA — Web Novels in 9 Languages",
    template: "%s | NARRA",
  },
  description: "Read Korean web novels translated into 9 languages with AI-locked proper nouns. Names stay consistent chapter to chapter.",
  robots: {
    index: true,
    follow: true,
    noarchive: true,
    noimageindex: true,
  },
  other: {
    'robots': 'noai, noimageai',
  },
  openGraph: {
    type: "website",
    siteName: "NARRA",
    title: "NARRA — Web Novels in 9 Languages",
    description: "Korean web novels with AI translation that actually keeps names consistent. 9 languages, free to read.",
    url: "https://www.narra.kr",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "NARRA — Web novels that feel written just for you",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NARRA — Web Novels in 9 Languages",
    description: "Korean web novels with AI translation that keeps names consistent chapter to chapter.",
    images: ["/og-default.svg"],
  },
};

const VALID_LOCALES: Locale[] = ["ko", "en", "ja", "zh", "es", "fr", "de", "pt", "id"];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 서버에서 locale 결정: cookie → 기본값 "en"
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("narra-locale")?.value as Locale | undefined;
  const locale: Locale = savedLocale && VALID_LOCALES.includes(savedLocale) ? savedLocale : "en";

  // 서버에서 dict 로드 (dynamic import → 해당 locale만)
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#faf8f3",
        }}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5VPV7S0M25"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5VPV7S0M25');
          `}
        </Script>

        <Providers initialLocale={locale} initialDict={dict}>
          <RefTracker />
          <Header />
          <main
            style={{
              paddingTop: 56,
            }}
          >
            {children}
          </main>
          <MusicPlayer />
          <BottomBar />
        </Providers>
      </body>
    </html>
  );
}
