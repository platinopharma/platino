'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Train,
  Bus,
  User,
  Users,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrders } from '@/stores';
import Link from 'next/link';
import { TransitBookingModal } from './TransitBookingModal';
import type { TransitMode, RecipientType } from '@/stores/useTransitBookingStore';

export function TransitHandoffBanner() {
  const router = useRouter();
  const orders = useOrders((s) => s.orders);
  const [activeMode, setActiveMode] = useState<TransitMode>('AIRPORT');
  const [recipient, setRecipient] = useState<RecipientType>('SELF');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showBookingWizard, setShowBookingWizard] = useState(false);

  // Check if there is an active order in transit
  const activeTransitOrder = orders.find(
    (o) =>
      o.status !== 'DELIVERED' &&
      o.status !== 'CANCELLED' &&
      o.status !== 'REJECTED' &&
      (o.deliveryCategory === 'AIRPORT' ||
        o.deliveryCategory === 'TRAIN' ||
        o.deliveryCategory === 'BUS' ||
        o.transitDetails?.hubName)
  );

  const handleOpenBookingWizard = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('transit_booking_mode', activeMode);
        sessionStorage.setItem('transit_recipient_type', recipient);
      }
    } catch (e) {
      console.error('Failed to write transit booking options to sessionStorage', e);
    }

    setShowBookingWizard(true);
  };

  // IF ACTIVE TRANSIT ORDER EXISTS: Show Live Tracking Handoff Bar
  if (activeTransitOrder) {
    const cat = activeTransitOrder.deliveryCategory || 'AIRPORT';
    const Icon = cat === 'AIRPORT' ? Plane : cat === 'TRAIN' ? Train : cat === 'BUS' ? Bus : MapPin;
    const isForSomeoneElse = activeTransitOrder.beneficiary?.type === 'OTHER';
    const recipientName = activeTransitOrder.beneficiary?.recipientName || 'Recipient';
    const recipientPhone = activeTransitOrder.beneficiary?.recipientPhone || '';
    const hubName = activeTransitOrder.transitDetails?.hubName || 'Transit Hub';
    const terminal = activeTransitOrder.transitDetails?.terminalOrPlatform || 'Handoff Point';

    return (
      <div className="w-full border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-600/10 text-emerald-600 border border-emerald-600/20">
              <Icon className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-600/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-600/30">
                  ACTIVE TRANSIT HANDOFF
                </span>
                <span className="text-xs text-muted-foreground font-mono">#{activeTransitOrder.id}</span>
              </div>
              <h4 className="mt-1 text-sm font-semibold text-foreground">
                {hubName} — {terminal}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Recipient: <strong className="text-foreground">{isForSomeoneElse ? recipientName : 'You'}</strong> ({recipientPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/orders/${activeTransitOrder.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 shadow-soft transition-transform active:scale-95"
            >
              Track Live Express Order <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PROMOTIONAL & INTERACTIVE BOOKING BANNER
  return (
    <>
      <div className="w-full border-b border-border bg-surface-elevated px-4 py-4 sm:px-8 shadow-xs">
        <div className="mx-auto max-w-7xl space-y-4">
          {/* Top Bar: Badge + Recipient Segmented Switch */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-600/20 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Express Transit Handoff
              </span>
            </div>

            {/* Recipient Segmented Toggle Switch */}
            <div className="inline-flex rounded-full border border-border bg-background p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setRecipient('SELF')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  recipient === 'SELF'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <User className="h-3.5 w-3.5" /> For Me
              </button>
              <button
                type="button"
                onClick={() => setRecipient('OTHER')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  recipient === 'OTHER'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Users className="h-3.5 w-3.5" /> For Someone Else
              </button>
            </div>
          </div>

          {/* Mode Selection Cards Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Airport Card */}
            <button
              type="button"
              onClick={() => setActiveMode('AIRPORT')}
              className={cn(
                'relative flex items-center justify-between rounded-2xl p-3.5 text-left transition-all cursor-pointer',
                activeMode === 'AIRPORT'
                  ? 'border-2 border-emerald-600 bg-white dark:bg-slate-900 shadow-md ring-1 ring-emerald-600/30 scale-[1.01]'
                  : 'border border-border bg-background hover:border-emerald-600/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                    activeMode === 'AIRPORT'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Airport Handoff</h4>
                  <p className="text-[11px] text-muted-foreground">Gates & Terminals</p>
                </div>
              </div>
              {activeMode === 'AIRPORT' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              )}
            </button>

            {/* Train Card */}
            <button
              type="button"
              onClick={() => setActiveMode('TRAIN')}
              className={cn(
                'relative flex items-center justify-between rounded-2xl p-3.5 text-left transition-all cursor-pointer',
                activeMode === 'TRAIN'
                  ? 'border-2 border-emerald-600 bg-white dark:bg-slate-900 shadow-md ring-1 ring-emerald-600/30 scale-[1.01]'
                  : 'border border-border bg-background hover:border-emerald-600/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                    activeMode === 'TRAIN'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Train className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Train Handoff</h4>
                  <p className="text-[11px] text-muted-foreground">Platforms & Coaches</p>
                </div>
              </div>
              {activeMode === 'TRAIN' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              )}
            </button>

            {/* Bus Card */}
            <button
              type="button"
              onClick={() => setActiveMode('BUS')}
              className={cn(
                'relative flex items-center justify-between rounded-2xl p-3.5 text-left transition-all cursor-pointer',
                activeMode === 'BUS'
                  ? 'border-2 border-emerald-600 bg-white dark:bg-slate-900 shadow-md ring-1 ring-emerald-600/30 scale-[1.01]'
                  : 'border border-border bg-background hover:border-emerald-600/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                    activeMode === 'BUS'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Bus className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Bus Handoff</h4>
                  <p className="text-[11px] text-muted-foreground">Terminals & Bays</p>
                </div>
              </div>
              {activeMode === 'BUS' && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              )}
            </button>
          </div>

          {/* Footer Bar: How It Works & Primary CTA */}
          <div className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-emerald-600" />
              How Express Transit Handoff Works
            </button>

            <button
              type="button"
              onClick={handleOpenBookingWizard}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              Book Transit Order <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Wizard Sub-screen Modal */}
      <TransitBookingModal
        isOpen={showBookingWizard}
        onClose={() => setShowBookingWizard(false)}
        initialMode={activeMode}
        initialRecipient={recipient}
      />

      {/* How It Works Informational Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface-elevated p-6 text-foreground shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> How Express Transit Delivery Works
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" /> 1. Select Transit Station & Gate
                </div>
                <p>Choose Airport Gate, Train Platform, or Bus Bay during checkout along with departure time.</p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" /> 2. Provide Recipient Contact Info
                </div>
                <p>Order for yourself or send urgent medicine to a family member traveling on a flight or train.</p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" /> 3. Live Express Handoff
                </div>
                <p>Our verified pharmacy runner hand-delivers your order directly to the passenger at the handoff point.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
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
