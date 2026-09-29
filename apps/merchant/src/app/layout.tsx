import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://platinopharma.com'),
  title: "Platino Pharmacy | Digital Platform for Local Pharmacies in India",
  description:
    "Platino Pharmacy helps local pharmacies digitize their business with online ordering, inventory management, prescription handling, customer management, analytics, and business growth tools.",
  keywords:
    "Platino Pharmacy, Digital Pharmacy Platform, Medical Store Software, Online Pharmacy Management, Pharmacy Management System, Pharmacy ERP, Medical Shop Software, Pharmacy Dashboard, Medicine Store Platform, Healthcare Commerce, Medicine Inventory, Prescription Orders, Medical Shop POS, Digital Pharmacy, Medicine Ordering Platform, Inventory Tracking, Online Medical Store, Pharmacy CRM, Medicine Delivery Software, Healthcare Technology, Best Pharmacy Management Software in India, Digital Platform for Medical Stores, Medical Store Dashboard, Online Pharmacy Management Software, Cloud Pharmacy Software, Inventory Management for Pharmacies, Prescription Order Management, Medicine Store Analytics, Healthcare SaaS Platform, Pharmacy Business Management",
  authors: [{ name: "Platino Pharmacy" }],
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    url: "/",
    title: "Platino Pharmacy | Digital Platform for Local Pharmacies in India",
    description: "Platino Pharmacy helps local pharmacies digitize their business with online ordering, inventory management, prescription handling, customer management, analytics, and business growth tools.",
    siteName: "Platino Pharmacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platino Pharmacy | Digital Platform for Local Pharmacies in India",
    description: "Platino Pharmacy helps local pharmacies digitize their business with online ordering, inventory management, prescription handling, customer management, analytics, and business growth tools.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sora.variable} ${inter.variable} ${jetBrainsMono.variable}`}>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
