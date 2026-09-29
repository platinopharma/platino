"use client";
import React from "react";
import { motion } from "framer-motion";
import { FormState } from "@/features/onboarding/types";
import { DOC_LIST } from "@/features/onboarding/constants";
import { DocBadge } from "./ui-helpers";

export function DocsStep({
  state,
  errors,
  onUpload,
}: {
  state: FormState;
  errors: Record<string, string>;
  onUpload: (key: string, file?: File) => void;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl text-ink">Upload your documents</h3>
      <p className="mt-1 text-sm text-ink-muted">
        All files are AES-256 encrypted at rest and in transit. OCR matches details against government registries.
      </p>
      {errors.docs && (
        <div className="mt-3 rounded-md border border-alert/30 bg-alert/10 px-3 py-2 text-[12px] text-alert">
          {errors.docs}
        </div>
      )}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {DOC_LIST.map((d) => {
          const st = state.docs[d.key];
          return (
            <div key={d.key} className="rounded-lg border border-line p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">{d.label}</div>
                <DocBadge state={st} />
              </div>
              {st === "idle" && (
                <label className="mt-3 flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-line py-4 text-[12px] text-ink-muted transition-colors hover:border-ink hover:text-ink">
                  + Click to upload (PDF / JPG / PNG)
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUpload(d.key, file);
                    }}
                  />
                </label>
              )}
              {st === "uploading" && (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-ink-subtle">
                    <span>encrypted upload</span>
                    <span>scanning…</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-line">
                    <motion.div
                      className="h-full bg-brand"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.6 }}
                    />
                  </div>
                </div>
              )}
              {st === "verified" && (
                <div className="mt-3 font-mono text-[10px] text-signal">✓ Verified · OCR matched registry</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
