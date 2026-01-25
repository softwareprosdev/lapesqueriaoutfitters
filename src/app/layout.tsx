import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { CartProvider } from "@/context/CartContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import SEOSchemas from "@/components/SEOSchemas";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FishermanChatbot } from "@/components/FishermanChatbot";
import AnalyticsProvider from "@/components/providers/AnalyticsProvider";
import ScrollProgress from "@/components/ScrollProgress";
import Script from "next/script";

// Primary heading font - bold, masculine sans-serif
const robotoCondensed = Roboto_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Body font - clean, highly readable sans-serif
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "La Pesqueria Outfitters | Fishing Gear, Apparel & Hats - McAllen TX",
  description: 'Premium fishing gear, apparel, T-shirts and hats in McAllen, TX. Shop high-quality fishing shirts, performance hats, outdoor apparel, and coastal gear at 4400 N 23rd St Suite 135.',
  keywords: [
    'fishing gear', 'fishing apparel', 'fishing hats', 'fishing shirts',
  ].join(', '),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#F9FBFC',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SEOSchemas key="seo-schemas" />
        {/* Google Translate Widget */}
        <Script
          key="google-translate-script"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${robotoCondensed.variable} ${inter.variable} antialiased min-h-screen flex flex-col bg-background text-foreground touch-manipulation selection:bg-accent/30 overflow-x-hidden w-full`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          storageKey="theme"
          disableTransitionOnChange
        >
          <SessionProvider>
            <CartProvider>
              <AnalyticsProvider />
              <ThemeToggle />
              <FishermanChatbot />
              <ScrollProgress />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </CartProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}