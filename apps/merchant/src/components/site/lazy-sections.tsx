'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const Stats = dynamic(() => import("./stats").then(m => m.Stats), { ssr: false });
const Why = dynamic(() => import("./why").then(m => m.Why), { ssr: false });
const Features = dynamic(() => import("./features").then(m => m.Features), { ssr: false });
const HowItWorks = dynamic(() => import("./how-it-works").then(m => m.HowItWorks), { ssr: false });
const RegistrationPreview = dynamic(() => import("./registration-preview").then(m => m.RegistrationPreview), { ssr: false });
const Testimonials = dynamic(() => import("./testimonials").then(m => m.Testimonials), { ssr: false });
const FAQ = dynamic(() => import("./faq").then(m => m.FAQ), { ssr: false });
const FinalCTA = dynamic(() => import("./final-cta").then(m => m.FinalCTA), { ssr: false });

export function LazySections() {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <div ref={ref} className="h-[200vh] w-full" />;
  }

  return (
    <>
      <Stats />
      <Why />
      <Features />
      <HowItWorks />
      <RegistrationPreview />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
