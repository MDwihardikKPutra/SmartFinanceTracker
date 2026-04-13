import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AIContainer from "@/components/AIContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartFinanceTracker",
  description: "Catat keuangan dengan bantuan AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased selection:bg-primary/10 selection:text-primary`}
    >
      <body className="h-full overflow-hidden flex flex-col bg-neutral-50">
        <Navbar />
        <main className="flex-1 pt-18 pb-8 w-full px-6 md:px-10 transition-all duration-500 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
