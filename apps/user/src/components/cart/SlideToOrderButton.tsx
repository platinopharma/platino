"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronsRight, Check, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/format";

interface SlideToOrderButtonProps {
  onOrderComplete: () => Promise<void> | void;
  totalAmount: number;
  disabled?: boolean;
}

export const SlideToOrderButton: React.FC<SlideToOrderButtonProps> = ({
  onOrderComplete,
  totalAmount,
  disabled = false,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragLimit, setDragLimit] = useState(0);
  const maxDrag = useMotionValue(0);
  const x = useMotionValue(0);

  // Measure container width dynamically to calculate max drag distance
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // inner width - handle width (48)
        const newMax = Math.max(0, entry.contentRect.width - 48);
        setDragLimit(newMax);
        maxDrag.set(newMax);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Modern Framer Motion derived values
  const fillWidth = useTransform(() => x.get() + 48);
  const textOpacity = useTransform(() => {
    const md = maxDrag.get();
    if (md === 0) return 1;
    return Math.max(0, 1 - (x.get() / (md * 0.5)));
  });

  const handleDragEnd = async () => {
    if (disabled || isLoading || isCompleted) return;

    // Check if slider dragged beyond 80% threshold
    const md = maxDrag.get();
    if (x.get() >= md * 0.8) {
      // Snap to end
      animate(x, md, { type: "spring", stiffness: 400, damping: 30 });
      setIsLoading(true);

      try {
        await onOrderComplete();
        setIsCompleted(true);
      } catch (error) {
        // Reset on failure
        animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Snap back to start if threshold not met
      animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-14 w-full rounded-2xl bg-primary/10 border border-primary/20 p-1 overflow-hidden select-none shadow-md flex items-center ${disabled ? "opacity-50 pointer-events-none" : ""
        }`}
    >
      {/* Dynamic Background Fill */}
      <motion.div
        style={{ width: fillWidth }}
        className="absolute inset-y-0 left-0 bg-primary rounded-xl z-0"
      />

      {/* Action Text */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center gap-2 z-10 pointer-events-none pl-12 pr-4"
      >
        <span className="text-foreground font-extrabold text-xs tracking-wider uppercase whitespace-nowrap">
          Slide to Order • {formatINR(totalAmount)}
        </span>
        <ChevronsRight className="w-4 h-4 text-foreground animate-pulse shrink-0" />
      </motion.div>

      {/* Draggable Handle */}
      <motion.div
        drag={!isLoading && !isCompleted ? "x" : false}
        dragConstraints={{ left: 0, right: dragLimit }}
        dragElastic={0.05}
        dragSnapToOrigin={false}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className={`relative z-20 h-12 w-12 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md transition-colors bg-card text-primary`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : isCompleted ? (
          <Check className="w-6 h-6 text-primary stroke-[3]" />
        ) : (
          <ChevronsRight className="w-6 h-6 stroke-[2.5]" />
        )}
      </motion.div>
    </div>
  );
};
