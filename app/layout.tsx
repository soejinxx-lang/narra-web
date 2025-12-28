import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

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
  description: "Web novel translation & reading platform",
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
        <Header />
        <main
          style={{
            paddingTop: 56, // ✅ 헤더 높이만큼 밀어줌 (최소 수정)
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
