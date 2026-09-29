"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export function VerifyStep({ pct, done }: { pct: number; done: boolean }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      {done ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 grid size-24 place-items-center rounded-full bg-signal/10 text-signal"
        >
          <CheckCircle2 className="size-12" />
        </motion.div>
      ) : (
        <div className="relative mb-6 grid size-24 place-items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-line border-t-brand"
          />
          <div className="grid size-16 place-items-center rounded-full bg-brand/10 text-brand">
            <ShieldAlert className="size-8" />
          </div>
        </div>
      )}

      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-subtle">
        {done ? "Verification complete" : "Pending Admin Approval"}
      </div>
      <h3 className="mt-2 max-w-lg font-display text-2xl leading-tight text-ink">
        {done
          ? "You're approved. Ready to activate."
          : "Our compliance team is reviewing your submission."}
      </h3>
      <p className="mt-4 max-w-md text-sm text-ink-muted">
        {done
          ? "Click 'Activate store' to finalize your registration and access the live dashboard."
          : "Your documents and business details are currently under manual review. This process ensures the highest standards of safety across the Platino network. Please check back later."}
      </p>

      {!done && (
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3 rounded-lg border border-line bg-paper-alt/40 p-4 text-left">
          <div className="flex items-center gap-3 text-sm text-ink font-medium">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
            Application Status: In Review
          </div>
          <div className="text-xs text-ink-subtle">
            Est. verification time: 2-4 hours
          </div>
        </div>
      )}
    </div>
  );
}
