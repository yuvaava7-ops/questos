import type { Metadata, Viewport } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel", display: "swap" });
const body = VT323({ weight: "400", subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "QuestOS",
  description: "A 16-bit RPG for your real life. Log quests, earn XP, level up.",
};

export const viewport: Viewport = {
  themeColor: "#0b0820",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
