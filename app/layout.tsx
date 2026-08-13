import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuestOS",
  description: "An RPG-styled personal life dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen font-sans text-text antialiased">
        {children}
      </body>
    </html>
  );
}
