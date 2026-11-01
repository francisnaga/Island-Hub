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
  // Required for env(safe-area-inset-bottom) to work on iPhone notch/home bar
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://jetty.francisnaga.site"),
  title: {
    default: "Jetty | NMU Campus Marketplace (Okerenkoko & Kurutie)",
    template: "%s | Jetty NMU",
  },
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
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://jetty.francisnaga.site",
    siteName: "Jetty NMU",
    title: "Jetty | NMU Campus Marketplace (Okerenkoko & Kurutie)",
    description:
      "The sovereign campus marketplace for Nigeria Maritime University. Direct WhatsApp ordering, verified student vendors, cadet kits, lodges, and campus services.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jetty — NMU Campus Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jetty | NMU Campus Marketplace",
    description:
      "The sovereign campus marketplace for Nigeria Maritime University. Direct WhatsApp ordering, verified student vendors, cadet kits, lodges, and campus services.",
    images: ["/og-image.png"],
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
        <link rel="preconnect" href="https://zagfgxhewhwothrbyesw.supabase.co" />
        <link rel="dns-prefetch" href="https://zagfgxhewhwothrbyesw.supabase.co" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
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
