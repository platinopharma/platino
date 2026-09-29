'use client';

import { useState } from "react";
import { useOrders } from "@/stores";
import { Plane, Train, Bus, Share2, ExternalLink, ArrowRight, ShieldCheck, Info, X, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LiveTransitBanner() {
  const orders = useOrders((s) => s.orders);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Find active transit order (AIRPORT, TRAIN, BUS or order with transitDetails)
  const activeTransitOrder = orders.find(
    (o) =>
      o.status !== "DELIVERED" &&
      o.status !== "CANCELLED" &&
      o.status !== "REJECTED" &&
      (o.deliveryCategory === "AIRPORT" ||
        o.deliveryCategory === "TRAIN" ||
        o.deliveryCategory === "BUS" ||
        o.transitDetails?.hubName)
  );

  // PROMOTIONAL BANNER: Clean, professional, PlatinoPharma Theme-matched (No Emojis)
  if (!activeTransitOrder) {
    return (
      <>
        <div className="w-full border-b border-border bg-surface-elevated px-4 py-3.5 sm:px-8 shadow-xs">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left Content */}
            <div className="flex items-center gap-3.5">
              {/* Multi-icon SVG composite badge */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <div className="flex items-center gap-1">
                  <Plane className="h-3.5 w-3.5" />
                  <Train className="h-3.5 w-3.5" />
                  <Bus className="h-3.5 w-3.5" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20 tracking-wider uppercase">
                    <Sparkles className="h-3 w-3" /> Express Transit Handoff
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Plane className="h-3.5 w-3.5 text-primary" /> Airport
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Train className="h-3.5 w-3.5 text-primary" /> Train
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
                      <Bus className="h-3.5 w-3.5 text-primary" /> Bus
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Traveling soon? Order medicines delivered directly to Terminal Gates, Train Platforms, or Bus Bays — for <strong className="text-foreground">You</strong> or <strong className="text-foreground">Someone Else</strong>.
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground hover:border-primary transition-colors"
              >
                <Info className="h-3.5 w-3.5 text-primary" /> How It Works
              </button>
              <Link
                href="/pharmacies"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] active:scale-95"
              >
                Book Transit Order <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Informational Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-surface-elevated p-6 text-foreground shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Multi-Modal Transit Delivery
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                    <CheckCircle2 className="h-4 w-4" /> 1. Select Transit Hub at Checkout
                  </div>
                  Choose Airport, Train, or Bus mode during checkout and enter your terminal/gate, platform/coach, or bay details.
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                    <CheckCircle2 className="h-4 w-4" /> 2. Self or Third-Party Beneficiary
                  </div>
                  Ordering for yourself or sending emergency medication to a family member traveling on a flight/train? Easily enter their recipient contact info.
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                    <CheckCircle2 className="h-4 w-4" /> 3. Live Telemetry & WhatsApp Handoff
                  </div>
                  Track courier movement in real time and share live status links via 1-tap WhatsApp integration.
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground shadow-soft"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ACTIVE TRANSIT ORDER BANNER: Clean theme-matched telemetry banner
  const cat = activeTransitOrder.deliveryCategory || "AIRPORT";
  const Icon = cat === "AIRPORT" ? Plane : cat === "TRAIN" ? Train : cat === "BUS" ? Bus : Plane;
  const isForSomeoneElse = activeTransitOrder.beneficiary?.type === "OTHER";
  const recipientName = activeTransitOrder.beneficiary?.recipientName || "Recipient";
  const recipientPhone = activeTransitOrder.beneficiary?.recipientPhone || "";
  const hubName = activeTransitOrder.transitDetails?.hubName || "Transit Hub";
  const terminal = activeTransitOrder.transitDetails?.terminalOrPlatform || "Handoff Point";

  const shareText = `Track your Platino Pharma medicine delivery to ${hubName} (${terminal}): https://platinopharma.com/orders/${activeTransitOrder.id}`;
  const whatsappUrl = `https://wa.me/${recipientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="w-full border-b border-primary/20 bg-primary/5 px-4 py-3.5 sm:px-8 shadow-xs">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Icon className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                ACTIVE TRANSIT ORDER
              </span>
              <span className="text-xs text-muted-foreground font-mono">#{activeTransitOrder.id}</span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-foreground">
              {hubName} — {terminal}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Recipient: <strong className="text-foreground">{isForSomeoneElse ? recipientName : "You"}</strong> ({recipientPhone})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {recipientPhone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 shadow-soft transition-transform active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5" /> Share via WhatsApp
            </a>
          )}
          <Link
            href={`/orders/${activeTransitOrder.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground hover:border-primary"
          >
            Track Order <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
