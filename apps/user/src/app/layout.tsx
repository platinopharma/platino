import type { Metadata, Viewport } from 'next';
import { Sora, Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';

import "@/styles.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";
import { Providers } from './providers';

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const viewport: Viewport = {
  themeColor: '#0F5132',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://platinopharma.com'),
  title: 'Platino Pharma — Order medicines from trusted local pharmacies. Pay on delivery.',
  description: 'Platino Pharma connects you with verified licensed pharmacies near you. Upload prescriptions, order medicines and healthcare products, and pay only when delivered. Inspect before you pay.',
  keywords: 'Platino Pharma, online pharmacy India, pay on delivery medicines, local pharmacy near me, prescription upload, verified pharmacies, medicine ordering platform',
  alternates: {
    canonical: '/',
    languages: { 'en-IN': '/', 'en': '/' },
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Platino Pharma — Trusted Local Pharmacies in India',
    description: 'Order medicines and healthcare essentials from verified nearby pharmacies with instant pay-on-delivery inspection.',
    siteName: 'Platino Pharma',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platino Pharma — Trusted Local Pharmacies in India',
    description: 'Order medicines from verified local pharmacies with simple prescription uploads and safe pay-on-delivery.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://platinopharma.com';
  const orgSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Platino Pharma",
        "url": baseUrl,
        "logo": `${baseUrl}/turtle-logo.png`,
        "sameAs": []
      },
      {
        "@type": "WebSite",
        "name": "Platino Pharma",
        "url": baseUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/search?query={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(orgSchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')}
        </Script>
        <Script 
          id="theme-initializer" 
          strategy="beforeInteractive"
        >
          {`try{var t=JSON.parse(localStorage.getItem('platino-theme'));var m=t&&t.state&&t.state.theme;if(m==='dark')document.documentElement.classList.add('dark');}catch(e){}`}
        </Script>
        <Script
          id="razorpay-sdk"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
          <CookieConsentBanner />
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
