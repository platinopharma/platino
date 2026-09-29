const quotes = [
  {
    q: "Platino replaced three tools and a shared spreadsheet. Our expiry write-off dropped 42% in the first quarter.",
    n: "Dr. Rohan Menon",
    r: "Owner · Green Cross, 4 stores",
  },
  {
    q: "The onboarding was the fastest of any enterprise tool we've used. We were live before lunch.",
    n: "Meera Sundaram",
    r: "Operations Lead · MediPoint",
  },
  {
    q: "Our pharmacists don't touch a mouse anymore. Keyboard shortcuts for every action — dispatch times dropped by 6 minutes.",
    n: "Devon Pereira",
    r: "Head Pharmacist · CityCare",
  },
  {
    q: "Analytics are the sharpest we've seen. We finally know which SKUs actually make money.",
    n: "Priya Nair",
    r: "CFO · Nova Pharma Group",
  },
];

export function Testimonials() {
  return (
    <section id="customers" className="border-t border-line bg-paper-alt/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">[ 07 ] Field notes</div>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            From the operators who trust Platino daily.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {quotes.map((t) => (
            <figure
              key={t.n}
              className="group rounded-2xl border border-line bg-paper p-8 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="font-display text-4xl leading-none text-ink-subtle">"</div>
              <blockquote className="mt-3 text-pretty text-lg leading-snug text-ink">{t.q}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <div className="grid size-9 place-items-center rounded-full bg-ink text-paper font-mono text-[11px]">
                  {t.n.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{t.n}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-subtle">{t.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}