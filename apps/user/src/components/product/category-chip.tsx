'use client';
import Link from 'next/link';
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import type { CategoryDef } from "@/lib/types";

export function CategoryChip({ category, index = 0 }: { category: CategoryDef; index?: number }) {
  const Icon = (Icons as any)[category.icon] ?? Icons.Pill;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
    >
      <Link
        href={`/category/${category.id}`}
        
        className="group flex h-[128px] w-[112px] shrink-0 flex-col items-center justify-start gap-2.5 rounded-2xl border border-border bg-surface-elevated px-3 py-4 shadow-soft outline-none transform-gpu transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-elevated focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <span className="line-clamp-2 text-center text-xs font-medium leading-tight">{category.name}</span>
      </Link>
    </motion.div>
  );
}
