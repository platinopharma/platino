export function FinalCTA() {
  return (
    <section id="book-demo" className="border-t border-line bg-ink text-paper">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(1 0 0 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.6) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-28 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
            [ 10 ] Get started
          </div>
          <h2 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
            Ready to grow your pharmacy?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-paper/60">
            Join hundreds of verified pharmacies already using Platino to run smarter, sell more and serve more customers.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/onboarding?new=true"
              className="group inline-flex items-center gap-2 rounded-md bg-paper px-6 py-3.5 text-sm font-medium text-ink transition-all hover:bg-hover"
            >
              Become a Verified Partner
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="mailto:partners@platinopharma.com"
              className="inline-flex items-center gap-2 rounded-md border border-paper/20 bg-transparent px-6 py-3.5 text-sm font-medium text-paper hover:bg-paper/5"
            >
              Talk to sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}