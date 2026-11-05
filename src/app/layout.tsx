import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: {
    default: "GEO Lab · 창업기업 성장 대시보드",
    template: "%s · GEO Lab",
  },
  description: "창업기업을 위한 GEO/SEO 4주 스터디. 주차별 체크리스트, 성장 기록, 사이트 체크를 한곳에서.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1420" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <StoreProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
