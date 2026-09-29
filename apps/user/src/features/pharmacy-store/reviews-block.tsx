'use client';
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { Star, ThumbsUp, ShieldCheck, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { reviewService } from "@/services";
import { cn } from "@/lib/utils";

type Filter = "all" | "high" | "low" | "photos" | "verified";

export function ReviewsBlock({
  pharmacyId,
  pharmacyRating,
  pharmacyReviewCount,
}: {
  pharmacyId: string;
  pharmacyRating: number;
  pharmacyReviewCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const { data } = useQuery({
    queryKey: ["reviews", pharmacyId],
    queryFn: () => reviewService.listByPharmacy(pharmacyId),
  });

  const filtered = (data ?? []).filter((r) => {
    if (filter === "high") return r.rating >= 4;
    if (filter === "low") return r.rating <= 3;
    if (filter === "photos") return (r.photos?.length ?? 0) > 0;
    if (filter === "verified") return r.verified;
    return true;
  });

  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = data?.filter((r) => Math.round(r.rating) === star).length ?? 0;
    const total = data?.length || 1;
    return { star, count, pct: (count / total) * 100 };
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <div className="text-6xl font-display font-medium">{pharmacyRating}</div>
          <div className="mt-1 flex items-center gap-1 text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Based on {pharmacyReviewCount.toLocaleString("en-IN")} reviews
          </div>
          <div className="mt-5 space-y-2">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="w-10 text-xs text-muted-foreground">{d.star} Stars</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: (5 - d.star) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: `${d.pct}%`, transformOrigin: "left center" }}
                    className="h-full rounded-full bg-primary will-change-transform"
                  />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { k: "all", l: "All" },
            { k: "high", l: "Highest rated" },
            { k: "low", l: "Lowest rated" },
            { k: "photos", l: "With photos" },
            { k: "verified", l: "Verified only" },
          ].map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k as Filter)}
              className={cn(
                "h-8 rounded-full border px-3 text-xs transition-colors",
                filter === f.k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface-elevated hover:border-primary",
              )}
            >
              {f.l}
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-4">
        {filtered.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-surface-elevated p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary font-medium">
                  {r.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {r.author}
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-trust/15 px-1.5 py-0.5 text-[10px] font-medium text-trust">
                        <ShieldCheck className="h-3 w-3" /> Verified purchase
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{r.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("h-3.5 w-3.5", i < r.rating ? "fill-current" : "opacity-30")} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed">{r.text}</p>
            {r.photos && r.photos.length > 0 && (
              <div className="mt-3 flex gap-2">
                {r.photos.map((ph, i) => (
                  <div key={i} className="h-16 w-16 overflow-hidden rounded-lg bg-muted">
                    <Image src={ph} alt="Review photo" width={64} height={64} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <button className="inline-flex items-center gap-1 hover:text-foreground">
                <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({r.helpful})
              </button>
            </div>
            {r.reply && (
              <div className="mt-4 rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <MessageCircle className="h-3.5 w-3.5 text-primary" />
                  {r.reply.author}
                  <span className="text-muted-foreground">· {r.reply.date}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.reply.text}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
