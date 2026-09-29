import Link from "next/link";
import Image from "next/image";

const cols = [
  { h: "Company", l: [{text: "About", href: "#"}, {text: "Careers", href: "#"}, {text: "Press", href: "#"}, {text: "Compliance", href: "#"}] },
  { h: "Platform", l: [{text: "Inventory", href: "#"}, {text: "Orders", href: "#"}, {text: "Delivery", href: "#"}, {text: "Analytics", href: "#"}, {text: "API", href: "#"}] },
  { h: "Support", l: [{text: "Help center", href: "#"}, {text: "Partner portal", href: "#"}, {text: "Status", href: "#"}, {text: "Contact", href: "#"}] },
  { h: "Legal", l: [{text: "Privacy Policy", href: "/legal/privacy-policy"}, {text: "Terms & Conditions", href: "/legal/terms-and-conditions"}, {text: "Partner Agreement", href: "/legal/pharmacy-partner-agreement"}, {text: "Refunds & Cancellations", href: "/legal/refund-cancellation"}, {text: "View All Legal", href: "/legal"}] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="grid gap-12 md:grid-cols-[2fr_3fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-12 w-auto items-center">
                <Image src="/turtle-logo.png" alt="Platino Pharma Logo" width={150} height={100} quality={100} priority className="h-full w-auto object-contain" />
              </span>
              <span className="font-mono text-[13px] font-semibold tracking-[0.14em]">
                PLATINO<span className="text-signal">PHARMA</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm text-paper/50">
              The operating layer for the modern pharmacy. Verified pharmacies, real-time inventory, precision logistics.
            </p>
            <div className="mt-8 flex gap-3">
              {["Tw", "Li", "Gh", "In"].map((s) => (
                <a key={s} href="#" className="grid size-9 place-items-center rounded-md border border-paper/15 font-mono text-[10px] text-paper/60 hover:bg-paper/10">
                  {s}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {cols.map((c) => (
              <div key={c.h}>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">{c.h}</div>
                <ul className="mt-4 space-y-2.5">
                  {c.l.map((li) => (
                    <li key={li.text}>
                      <Link href={li.href} className="text-sm text-paper/70 hover:text-signal">{li.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-6 md:flex-row">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
            © 2026 platinopharma · All rights reserved
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40">
            operations · encrypted · v2.4.1
          </div>
        </div>

        {/* Oversized wordmark */}
        <div className="mt-12 -mb-2 select-none overflow-hidden text-center">
          <div className="whitespace-nowrap font-display text-[10vw] leading-[0.9] tracking-[-0.03em] text-paper/[0.05] md:text-[11vw]">
            platinopharma
          </div>
        </div>
      </div>
    </footer>
  );
}