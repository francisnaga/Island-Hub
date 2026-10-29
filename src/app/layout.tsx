import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const viewport: Viewport = {
  themeColor: "#090D16",
};

export const metadata: Metadata = {
  title: "Jetty | NMU Campus Marketplace (Okerenkoko & Kurutie)",
  description:
    "Jetty is the campus marketplace for Nigeria Maritime University (NMU), covering Okerenkoko and Kurutie. Discover cadet gear, housing, campus services, electronics, and daily essentials.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/jetty-favicon.svg", type: "image/svg+xml" },
      { url: "/jetty-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/jetty-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/jetty-icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/jetty-favicon.svg" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen flex flex-col bg-background text-foreground antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
