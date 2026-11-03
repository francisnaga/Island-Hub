import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
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
    "Jetty is the sovereign campus marketplace for Nigeria Maritime University (NMU), covering Okerenkoko and Kurutie campuses. Find student lodges & bedspaces, cadet uniforms & safety boots, campus food, tailoring, haircuts, and essentials with direct WhatsApp ordering.",
  keywords: [
    "Nigeria Maritime University",
    "NMU",
    "NMU Okerenkoko",
    "NMU Kurutie",
    "Jetty",
    "Jetty NMU",
    "Jetty marketplace",
    "NMU campus market",
    "NMU cadet uniforms",
    "NMU action rig",
    "cadet gear NMU",
    "safety boots NMU",
    "steel toe boots Okerenkoko",
    "NMU lodge",
    "NMU hostels",
    "student bedspace Okerenkoko",
    "hostel accommodation Kurutie",
    "rooms near NMU",
    "campus services NMU",
    "NMU tailoring",
    "NMU barber",
    "Delta State university marketplace",
    "buy and sell NMU",
    "student vendors Okerenkoko",
    "NMU fresher kit",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/jetty-favicon.svg", type: "image/svg+xml" },
      { url: "/jetty-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/jetty-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/jetty-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/jetty-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "https://jetty.francisnaga.site",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://jetty.francisnaga.site",
    siteName: "Jetty NMU",
    title: "Jetty | NMU Campus Marketplace (Okerenkoko & Kurutie)",
    description:
      "The sovereign campus marketplace for Nigeria Maritime University (NMU). Lodges, cadet uniforms, campus services, and daily essentials with direct WhatsApp ordering.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jetty — NMU Campus Marketplace (Okerenkoko & Kurutie)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jetty | NMU Campus Marketplace",
    description:
      "The sovereign campus marketplace for Nigeria Maritime University (NMU). Lodges, cadet uniforms, campus services, and daily essentials with direct WhatsApp ordering.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "marketplace",
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://jetty.francisnaga.site/#website",
      url: "https://jetty.francisnaga.site",
      name: "Jetty",
      alternateName: [
        "Jetty NMU",
        "Jetty Marketplace",
        "Nigeria Maritime University Marketplace",
        "NMU Marketplace",
        "IslandHub",
      ],
      description:
        "The sovereign campus marketplace for Nigeria Maritime University (NMU), Okerenkoko and Kurutie.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://jetty.francisnaga.site/marketplace?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://jetty.francisnaga.site/#organization",
      name: "Jetty NMU",
      alternateName: "Nigeria Maritime University Campus Marketplace",
      url: "https://jetty.francisnaga.site",
      logo: "https://jetty.francisnaga.site/jetty-icon-512.png",
      image: "https://jetty.francisnaga.site/og-image.png",
      description:
        "Sovereign campus marketplace connecting students and verified vendors across Nigeria Maritime University (NMU) Okerenkoko and Kurutie campuses.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Okerenkoko",
        addressRegion: "Delta State",
        addressCountry: "NG",
      },
      areaServed: [
        {
          "@type": "AdministrativeArea",
          name: "Nigeria Maritime University",
        },
        {
          "@type": "City",
          name: "Okerenkoko",
        },
        {
          "@type": "City",
          name: "Kurutie",
        },
        {
          "@type": "AdministrativeArea",
          name: "Delta State",
        },
        {
          "@type": "Country",
          name: "Nigeria",
        },
      ],
      knowsAbout: [
        "Nigeria Maritime University",
        "NMU Cadet Uniforms & Gear",
        "Student Accommodation in Okerenkoko",
        "Student Hostels in Kurutie",
        "Campus Services",
        "Maritime Cadet Action Rigs",
        "Safety Boots Steel Toe",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${bricolage.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/jetty-favicon.svg" />
        <link rel="apple-touch-icon" href="/jetty-icon-192.png" />
        <link rel="preconnect" href="https://zagfgxhewhwothrbyesw.supabase.co" />
        <link rel="dns-prefetch" href="https://zagfgxhewhwothrbyesw.supabase.co" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-[#0A4F4F] text-foreground font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
