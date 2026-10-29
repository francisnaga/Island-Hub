import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/jetty-favicon.svg?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-sans min-h-screen flex flex-col bg-background text-foreground antialiased"
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
