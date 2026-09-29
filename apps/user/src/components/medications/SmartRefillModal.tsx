'use client';

import { useState, useRef } from 'react';
import { X, ShieldCheck, Pill, CheckCircle2, ChevronRight, Store, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRefill: (orderDetails: { orderId: string; title: string; price: number }) => void;
  medicineTitle?: string;
  price?: number;
}

export function SmartRefillModal({
  isOpen,
  onClose,
  onConfirmRefill,
  medicineTitle = 'Amoxicillin 500mg - Strip of 10 capsules',
  price = 145,
}: SmartRefillModalProps) {
  const [isSliding, setIsSliding] = useState(false);
  const [slideConfirmed, setSlideConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSlideComplete = () => {
    setSlideConfirmed(true);
    setIsSubmitting(true);

    setTimeout(() => {
      onConfirmRefill({
        title: medicineTitle,
        price,
        orderId: `ORD-REFILL-${Date.now()}`,
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header & Store Badge */}
        <div className="border-b border-gray-100 p-5 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-gray-900">
              Smart Refill Confirmation
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Dynamic Store Badge */}
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800">
            <Store className="h-4 w-4 text-emerald-800 shrink-0" />
            <span className="truncate">Sri Sai Medicals · 0.8 km away | ETA 15-20 Mins</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* SECTION: ITEM DETAILS */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Item Details
            </div>

            <div className="flex items-start gap-3.5 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                <Pill className="h-6 w-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">
                  {medicineTitle}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-extrabold text-gray-900">₹{price}</span>
                  <span className="text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                    Qty: 1
                  </span>
                </div>
              </div>
            </div>

            {/* Prescription Badge */}
            <div className="flex items-center gap-2.5 rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs text-sky-900">
              <ShieldCheck className="h-4 w-4 text-sky-700 shrink-0" />
              <span className="font-semibold">Valid prescription on file. No new upload needed.</span>
            </div>
          </div>

          {/* SECTION: BILL DETAILS */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Bill Details
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-gray-700">
                <span>Item Subtotal</span>
                <span>₹{price}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-800">
                <span>Express Refill Delivery</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-gray-900 border-t border-gray-200 pt-2">
                <span>Total Amount Due</span>
                <span>₹{price}</span>
              </div>
            </div>

            <p className="text-[11px] font-semibold text-gray-500 text-center">
              Lock & Secure payment via saved UPI / Cash on Delivery
            </p>
          </div>

          {/* ACTION: INTERACTIVE SLIDE TO CONFIRM REFILL */}
          <div className="pt-2">
            {!slideConfirmed ? (
              <button
                type="button"
                onClick={handleSlideComplete}
                className="relative flex items-center justify-center gap-3 w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white py-3.5 px-6 font-semibold shadow-sm transition-all cursor-pointer group text-sm"
              >
                <span>SLIDE TO CONFIRM REFILL</span>
                <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 text-white py-3.5 px-6 font-semibold text-sm">
                <Loader2 className="h-5 w-5 animate-spin" /> Placing Order...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
