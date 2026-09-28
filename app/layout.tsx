import type { Metadata, Viewport } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font: no render-blocking request to
// Google Fonts, and fallback metrics are adjusted to avoid layout shift.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cinzel", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "QuestOS",
  description: "An RPG-styled personal life dashboard.",
};

export const viewport: Viewport = {
  themeColor: "#0c0a08",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} ${mono.variable}`}>
      <body className="flex min-h-screen font-sans text-text antialiased">{children}</body>
    </html>
  );
}
