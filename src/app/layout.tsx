import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { FirstTimeGuide } from "@/components/common/FirstTimeGuide";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A4F4F",
};

export const metadata: Metadata = {
  title: "Jetty | NMU Campus Marketplace (Okerenkoko & Kurutie)",
  description:
    "Jetty is the sovereign campus marketplace for Nigeria Maritime University (NMU), covering Okerenkoko and Kurutie. Discover uniforms & cadet kits, lodges & bedspaces, campus services, electronics, and daily essentials.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/jetty-favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/jetty-icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/jetty-icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/jetty-icon-192.png?v=2", sizes: "192x192", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${bricolage.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/jetty-favicon.svg?v=2" />
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <FirstTimeGuide />
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
