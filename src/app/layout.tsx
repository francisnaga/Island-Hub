import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IslandHub | Campus Unity",
  description: "The ultimate student platform for housing, services, and campus updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased selection:bg-gold/30`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
