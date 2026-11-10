import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "İK & Mevzuat Akademisi — Cihan Ahtik",
  description:
    "12 Temel Türk İş & Sosyal Güvenlik Kanunu, 10 İK Tekniği, 14 İK Metodu, Günlük İK Bilgisi, Kıdem/İhbar/Maaş Hesaplayıcıları, Resmî Şablonlar, Soru Bankası ve Sesli PRO İK Robotu. Bu uygulama Cihan Ahtik tarafından yapılmıştır.",
  applicationName: "İK Akademisi",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "İK Akademisi",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  keywords: ["insan kaynakları", "iş kanunu", "4857", "5510", "KVKK", "kıdem tazminatı hesaplama", "İK robotu", "Cihan Ahtik"],
  authors: [{ name: "Cihan Ahtik" }],
  creator: "Cihan Ahtik",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[#f6f7f9] font-sans text-[#0f172a] antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
