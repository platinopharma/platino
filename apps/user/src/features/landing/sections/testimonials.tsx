'use client';
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeader } from "@/components/ui-parts/section-header";

const quotes = [
  {
    name: "Aditi Sharma",
    role: "Madhapur, Hyderabad",
    text: "Feels like I have a pharmacist on speed-dial. Prescriptions filled and delivered in under 25 minutes.",
    image: "/images/avatar-1.jpg",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Chronic Care Patient",
    text: "The monthly medicine subscription is a lifesaver. I never have to worry about running out of my blood pressure medication. Their authentic products give me peace of mind.",
    image: "/images/avatar-2.jpg",
  },
  {
    id: 3,
    name: "Sneha Reddy",
    role: "Mother of two",
    text: "When my daughter had a fever at 2 AM, Platino Pharmacy delivered the prescribed medicines within 15 minutes. Their 24/7 service is truly commendable.",
    image: "/images/avatar-3.jpg",
  },
];

export function Testimonials() {
  return (
    <section>
      <SectionHeader
        eyebrow="Loved across India"
        title="Real customers. Real stories."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.figure
            key={q.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col rounded-3xl border border-border bg-surface-elevated p-6 shadow-soft"
          >
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-base leading-relaxed">
              "{q.text}"
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <img
                src={q.image}
                alt={`Portrait of ${q.name}, healthcare customer from ${q.role}`}
                className="h-10 w-10 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <div className="text-sm font-medium">{q.name}</div>
                <div className="text-xs text-muted-foreground">{q.role}</div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
