import { ReactNode } from "react";

export function LegalH1({ children }: { children: ReactNode }) {
  return <h1 className="text-4xl font-display font-semibold tracking-tight text-ink mb-8">{children}</h1>;
}

export function LegalH2({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl font-display font-medium tracking-tight text-ink mt-12 mb-4">{children}</h2>;
}

export function LegalH3({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold text-ink mt-8 mb-3">{children}</h3>;
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-ink-muted leading-relaxed mb-4">{children}</p>;
}

export function LegalUl({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 text-ink-muted space-y-2 mb-6">{children}</ul>;
}

export function LegalLi({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}
