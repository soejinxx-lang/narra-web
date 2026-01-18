import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "./components/Header";
import MusicPlayer from "./components/MusicPlayer";
import BottomBar from "./components/BottomBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NARRA",
  description: "Discover stories from around the world. Web novels that feel written just for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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

        <Header />
        <main
          style={{
            paddingTop: 56, // ✅ 헤더 높이만큼 밀어줌
          }}
        >
          {children}
        </main>
        <MusicPlayer />
        <BottomBar />
      </body>
    </html>
  );
}
