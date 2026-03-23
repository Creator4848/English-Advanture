import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "English Adventure – Bolalar uchun ingliz tili",
  description: "Video darslar, interaktiv testlar va AI Speaking Club bilan ingliz tilini o'rganing. Boshlang'ich maktab o'quvchilari uchun.",
  keywords: ["ingliz tili", "bolalar", "edtech", "speaking club", "AI tutor"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${inter.variable} ${outfit.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
