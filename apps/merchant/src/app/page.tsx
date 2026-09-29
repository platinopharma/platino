import { Metadata } from "next";
import Script from "next/script";
import { SiteNav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { LazySections } from "@/components/site/lazy-sections";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://platinopharma.com/#organization",
      "name": "Platino Pharmacy",
      "url": "https://platinopharma.com/",
      "logo": "https://platinopharma.com/turtle-logo.png",
      "description": "Platino Pharmacy is India's modern digital platform designed exclusively for pharmacies."
    },
    {
      "@type": "WebSite",
      "@id": "https://platinopharma.com/#website",
      "url": "https://platinopharma.com/",
      "name": "Platino Pharmacy",
      "publisher": {
        "@id": "https://platinopharma.com/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Platino Pharmacy Platform",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "url": "https://platinopharma.com/",
      "provider": {
        "@id": "https://platinopharma.com/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Platino Pharmacy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Platino Pharmacy is a digital platform that helps pharmacies manage inventory, orders, customers, prescriptions, and online business operations."
          }
        },
        {
          "@type": "Question",
          "name": "Who can join Platino Pharmacy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Licensed pharmacies, medical stores, and pharmacy chains can register to use the platform."
          }
        },
        {
          "@type": "Question",
          "name": "Does Platino Pharmacy sell medicines?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Medicines are sold directly by registered pharmacy partners."
          }
        },
        {
          "@type": "Question",
          "name": "Can pharmacies control pricing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Every pharmacy independently manages its own pricing and inventory."
          }
        },
        {
          "@type": "Question",
          "name": "Is inventory managed by Platino Pharmacy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Inventory is maintained entirely by each pharmacy."
          }
        },
        {
          "@type": "Question",
          "name": "Does Platino Pharmacy own medicines?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Platino Pharmacy is a technology platform and does not own or stock medicines."
          }
        },
        {
          "@type": "Question",
          "name": "Can customers upload prescriptions?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Customers can securely upload prescriptions for pharmacist verification before eligible medicines are dispensed."
          }
        },
        {
          "@type": "Question",
          "name": "Is Platino Pharmacy cloud based?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The platform is fully cloud-based and accessible from anywhere."
          }
        },
        {
          "@type": "Question",
          "name": "Can multiple staff members use one pharmacy account?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Pharmacies can create staff accounts with role-based permissions."
          }
        },
        {
          "@type": "Question",
          "name": "Does Platino Pharmacy support analytics?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Pharmacies receive detailed dashboards covering sales, orders, inventory performance, and customer insights."
          }
        }
      ]
    }
  ]
};

export default function Index() {
  return (
    <>
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-dvh bg-paper font-sans text-ink antialiased">
        <SiteNav />
        <Hero />
        <LazySections />
        <SiteFooter />
      </main>
    </>
  );
}
