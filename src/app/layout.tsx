import "@/lib/env";
import "@/instrumentation-client";
import * as Sentry from "@sentry/nextjs";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeScript } from "@/components/ThemeScript";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: { default: "Leish! — Beauty Booking Marketplace", template: "%s | Leish!" },
  description:
    "Book Beauty. Anywhere. Discover makeup artists and studios across Malaysia, view real-time availability, and secure your booking in minutes.",
  keywords: ["makeup artist", "beauty booking", "Malaysia", "bridal makeup", "hijab makeup", "studio booking"],
  metadataBase: new URL("https://leish.my"),
  openGraph: {
    title: "Leish! — Beauty Booking Marketplace",
    description: "Book Beauty. Anywhere. Discover makeup artists and studios across Malaysia.",
    url: "https://leish.my",
    siteName: "Leish!",
    locale: "en_MY",
    type: "website",
    images: [
      {
        url: "/hero-warm-tones.png",
        width: 1200,
        height: 630,
        alt: "Leish! beauty booking marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leish! — Beauty Booking Marketplace",
    description: "Book Beauty. Anywhere. Discover makeup artists and studios across Malaysia.",
    images: ["/hero-warm-tones.png"],
  },
  robots: { index: true, follow: true },
};

import Providers from "@/components/Providers";
import ErrorState from "@/components/ErrorState";
import BackToTop from "@/components/BackToTop";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import Script from "next/script";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const hdrs = await headers();
  const nonce = hdrs.get("x-nonce") || undefined;
  return (
    <html lang="en" suppressHydrationWarning>
<head>
  <link rel="icon" href="/leishlogo.svg" type="image/svg+xml" />
  <ThemeScript nonce={nonce} />
  <link rel="manifest" href="/manifest.json" />
          {gaId && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" nonce={nonce} />
<Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });
`}
</Script>
            </>
          )}
          {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
            <>
              <Script id="meta-pixel" strategy="afterInteractive" nonce={nonce}>
                {`
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                  fbq('track', 'PageView');
                `}
              </Script>
              <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  height="1"
                  width="1"
                  style={{ display: "none" }}
                  src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
                  alt=""
                />
              </noscript>
            </>
          )}
      </head>
      <body className="antialiased">
        <Sentry.ErrorBoundary
          fallback={({ error, resetError }) => (
            <ErrorState error={error as Error & { digest?: string }} reset={resetError} />
          )}
        >
          <Providers>
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer />
            <BackToTop />
            <AccessibilityMenu />
          </Providers>
        </Sentry.ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  );
}
