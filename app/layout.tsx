import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Header */}
        <header
          style={{
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <strong>NARRA</strong>
          <nav>
            <details>
              <summary style={{ cursor: "pointer" }}>☰</summary>
              <ul
                style={{
                  listStyle: "none",
                  padding: "8px 0",
                  margin: 0,
                }}
              >
                <li><Link href="/">Home</Link></li>
                <li><Link href="/novels">All Novels</Link></li>
                <li><Link href="/browse">Browse</Link></li>
                <li><Link href="/about">About NARRA</Link></li>
                <li><Link href="/notes">Translation Notes</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </details>
          </nav>
        </header>

        {/* Page Content */}
        <main style={{ padding: "16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
