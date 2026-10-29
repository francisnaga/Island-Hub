import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "IslandHub Marketplace | NMU & Okerenkoko Campus Marketplace",
  description:
    "Discover maritime & cadet gear, safety boots, action rigs, electronics, books, and daily essentials from verified vendors around Nigeria Maritime University (NMU), Okerenkoko.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 antialiased`}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
