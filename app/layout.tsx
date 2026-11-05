import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "GEO Study · 나의 성장 대시보드",
  description: "GEO/SEO 스터디 목표와 체크리스트, 일일 기록을 한곳에서 관리하세요.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <Nav />
        <main className="page">{children}</main>
      </body>
    </html>
  );
}
