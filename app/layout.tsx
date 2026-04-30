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
  title: "Video Insight AI - YouTube Summarizer",
  description: "Extract transcripts, generate summaries, and chat with your YouTube videos using state-of-the-art AI.",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-white">
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          }
        }} />
      </body>
    </html>
  );
}
