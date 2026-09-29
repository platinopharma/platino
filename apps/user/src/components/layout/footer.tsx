'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-6 lg:gap-8 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-auto items-center">
              <Image src="/turtle-logo.png" alt="Platino Pharma Logo" width={150} height={100} quality={100} priority className="h-full w-auto object-contain" />
            </div>
            <span className="font-display text-xl">Platino Pharma</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            India's next-generation healthcare commerce platform — connecting you with verified
            local pharmacies for medicines, wellness, and everyday care.
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Twitter, label: "Twitter" },
              { Icon: Youtube, label: "YouTube" },
              { Icon: Linkedin, label: "LinkedIn" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={`Platino Pharma on ${label}`}
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface-elevated text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title="Platino"
          links={[
            { to: "/pharmacies", label: "Nearby pharmacies" },
            { to: "/wishlist", label: "Wishlist" },
            { to: "/orders", label: "Your orders" },
            { to: "/account", label: "Account" },
          ]}
        />
        <FooterCol
          title="Categories"
          links={[
            { to: "/category/medicines", label: "Medicines" },
            { to: "/category/healthcare", label: "Healthcare" },
            { to: "/category/diabetes", label: "Diabetes care" },
            { to: "/category/ayurveda", label: "Ayurveda" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/", label: "About" },
            { to: "/", label: "Careers" },
            { to: "/", label: "Press" },
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { to: "/legal", label: "All policies" },
            { to: "/legal/terms", label: "Terms & conditions" },
            { to: "/legal/privacy", label: "Privacy policy" },
            { to: "/legal/refunds", label: "Refunds & returns" },
            { to: "/legal/grievance", label: "Grievance redressal" },
          ]}
        />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© 2026 Platinopharma · All rights reserved</span>
          <span>Operations · Encrypted · v2.4.1</span>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden pb-24 lg:pb-0"
        style={{
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
        aria-hidden="true"
      >
        <div className="pointer-events-none flex items-end justify-center">
          <span
            aria-hidden="true"
            className="block max-w-full select-none whitespace-nowrap font-display font-medium leading-[0.8] tracking-[-0.05em] text-foreground/[0.06] dark:text-foreground/[0.09]"
            style={{ fontSize: "clamp(2.5rem, 12vw, 14rem)" }}
          >
            platinopharma
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="font-display text-sm font-medium">{title}</h4>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
