import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ClipViral — AI-Powered Viral Clip Generator for Creators",
  description:
    "Turn long-form streams, podcasts, and videos into viral TikTok, Reels, and Shorts clips automatically with AI. Used by 50,000+ creators.",
  keywords: [
    "AI clip generator",
    "viral clips",
    "TikTok clips",
    "stream highlights",
    "podcast clips",
    "content repurposing",
    "YouTube Shorts",
    "Instagram Reels",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
