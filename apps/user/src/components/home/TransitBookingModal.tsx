'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Train,
  Bus,
  User,
  Users,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  X,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useTransitBookingStore,
  type TransitMode,
  type RecipientType,
} from '@/stores/useTransitBookingStore';
import { TransitLocationPicker, type LocationHub } from './TransitLocationPicker';

interface TransitBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: TransitMode;
  initialRecipient?: RecipientType;
}

export function TransitBookingModal({
  isOpen,
  onClose,
  initialMode = 'AIRPORT',
  initialRecipient = 'SELF',
}: TransitBookingModalProps) {
  const router = useRouter();
  const setTransitBooking = useTransitBookingStore((s) => s.setTransitBooking);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mode, setMode] = useState<TransitMode>(initialMode);
  const [recipient, setRecipient] = useState<RecipientType>(initialRecipient);

  // Zomato-style location picker state
  const [selectedHub, setSelectedHub] = useState<LocationHub>({
    name: 'Rajiv Gandhi International Airport (HYD)',
    code: 'HYD',
    mode: 'AIRPORT',
    coords: [78.4299, 17.2403],
    address: 'Shamshabad, Hyderabad, Telangana 500108',
  });
  const [pickupPoint, setPickupPoint] = useState('Departure Gate 3');
  const [gateOrPlatform, setGateOrPlatform] = useState('Terminal 1 / Gate 4B');
  const [flightOrTrainNo, setFlightOrTrainNo] = useState('6E-204');
  const [coachOrSeat, setCoachOrSeat] = useState('B3 / Seat 24');
  const [pnr, setPnr] = useState('48210943');

  // Beneficiary Info
  const [recipientName, setRecipientName] = useState('Awais Nadeem');
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  if (!isOpen) return null;

  const handleNext = () => setStep((s) => Math.min(4, s + 1) as any);
  const handleBack = () => setStep((s) => Math.max(1, s - 1) as any);

  const handleLocationConfirmedFromPicker = (data: {
    hub: LocationHub;
    pickupPoint: string;
    coords: [number, number];
    gateOrPlatform: string;
    flightOrTrainNo: string;
    coachOrSeat?: string;
    pnr?: string;
  }) => {
    setSelectedHub(data.hub);
    setPickupPoint(data.pickupPoint);
    setGateOrPlatform(data.gateOrPlatform);
    setFlightOrTrainNo(data.flightOrTrainNo);
    if (data.coachOrSeat) setCoachOrSeat(data.coachOrSeat);
    if (data.pnr) setPnr(data.pnr);
    setStep(2);
  };

  const handleCompleteAndProceed = () => {
    setTransitBooking({
      mode,
      recipientType: recipient,
      recipientDetails: {
        name: recipient === 'SELF' ? recipientName || 'Awais Nadeem' : recipientName,
        phone: recipientPhone,
        alternatePhone,
        sendWhatsappNotification: sendWhatsapp,
      },
      transitDetails: {
        hubName: selectedHub.name,
        hubCode: selectedHub.code,
        terminalOrPlatform: gateOrPlatform,
        coachOrSeatOrBay: coachOrSeat,
        pnrOrFlightNo: flightOrTrainNo,
        coordinates: selectedHub.coords,
        handoffPointLabel: pickupPoint,
      },
    });

    onClose();
    router.push('/pharmacies?transit=true');
  };

  const Icon = mode === 'AIRPORT' ? Plane : mode === 'TRAIN' ? Train : Bus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface-elevated text-foreground shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-background">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Step {step} of 4 — Zomato-Style Location Engine
              </span>
              <h3 className="font-display text-base font-bold text-foreground">
                {step === 1 && '1. Pinpoint Location & Station Handoff'}
                {step === 2 && '2. Passenger & Beneficiary Contact Info'}
                {step === 3 && '3. Verify Interactive Drop-off Location'}
                {step === 4 && '4. Confirm Booking & Proceed to Medicines'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* SUB-SCREEN 1: Zomato-Style Location Picker Engine */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Mode Toggle Switch */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-muted border border-border">
                {(['AIRPORT', 'TRAIN', 'BUS'] as TransitMode[]).map((m) => {
                  const ModeIcon = m === 'AIRPORT' ? Plane : m === 'TRAIN' ? Train : Bus;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer',
                        mode === m
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <ModeIcon className="h-4 w-4" /> {m}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Zomato-Style Location Picker */}
              <TransitLocationPicker
                mode={mode}
                onConfirmLocation={handleLocationConfirmedFromPicker}
              />
            </div>
          )}

          {/* SUB-SCREEN 2: Recipient / Beneficiary Info */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Recipient Segmented Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted border border-border">
                <button
                  type="button"
                  onClick={() => setRecipient('SELF')}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer',
                    recipient === 'SELF'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <User className="h-4 w-4" /> For Me (Self Passenger)
                </button>
                <button
                  type="button"
                  onClick={() => setRecipient('OTHER')}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer',
                    recipient === 'OTHER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Users className="h-4 w-4" /> For Someone Else
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Passenger / Recipient Full Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter passenger name"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Passenger Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Alternate On-Site Phone
                  </label>
                  <input
                    type="text"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="Optional emergency phone"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {recipient === 'OTHER' && (
                <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-border bg-background cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendWhatsapp}
                    onChange={(e) => setSendWhatsapp(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600 rounded-sm"
                  />
                  <span className="text-xs font-medium text-foreground">
                    Send WhatsApp Express Handoff Tracking Link to Passenger
                  </span>
                </label>
              )}
            </div>
          )}

          {/* SUB-SCREEN 3: Precise Map Verification & Coordinates Card */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-600/30 bg-emerald-600/5 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-600/20 pb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase">
                    <Icon className="h-4 w-4" /> Location Verification
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-600/15 px-2.5 py-0.5 rounded-full">
                    GPS Coordinates Active
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Selected Station/Hub:</span>
                  <strong className="text-foreground text-sm block">{selectedHub.name}</strong>
                  <span className="text-muted-foreground text-[11px] block">{selectedHub.address}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-600/20">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Pickup Handoff Point:</span>
                    <strong className="text-foreground">{pickupPoint}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Terminal / Gate / Platform:</span>
                    <strong className="text-foreground">{gateOrPlatform}</strong>
                  </div>
                </div>
              </div>

              {/* Large Map Verification Box */}
              <div className="relative h-44 w-full rounded-2xl border border-border overflow-hidden bg-muted">
                <iframe
                  title="Transit Location Verification Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedHub.coords[0] - 0.008},${selectedHub.coords[1] - 0.008},${selectedHub.coords[0] + 0.008},${selectedHub.coords[1] + 0.008}&layer=mapnik&marker=${selectedHub.coords[1]},${selectedHub.coords[0]}`}
                />
                <div className="absolute bottom-2 left-2 right-2 rounded-xl bg-background/90 backdrop-blur-xs p-2 text-[11px] font-semibold text-foreground border border-border flex items-center justify-between">
                  <span className="truncate">{pickupPoint} — {gateOrPlatform}</span>
                  <span className="font-mono text-[10px] text-emerald-600 shrink-0 ml-2">
                    {selectedHub.coords[1].toFixed(4)}, {selectedHub.coords[0].toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SCREEN 4: Confirmation & Checkout Handoff */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-600/30 bg-emerald-600/5 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-600/20 pb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase">
                    <Icon className="h-4 w-4" /> {mode} Express Handoff Summary
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-600/15 px-2.5 py-0.5 rounded-full">
                    Ready for Checkout
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Hub / Station:</span>
                    <strong className="text-foreground">{selectedHub.name}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Terminal / Gate / Platform:</span>
                    <strong className="text-foreground">{gateOrPlatform}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Recipient / Passenger:</span>
                    <strong className="text-foreground">{recipientName} ({recipientPhone})</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Flight / Train / Ticket No:</span>
                    <strong className="text-foreground">{flightOrTrainNo}</strong>
                  </div>
                </div>

                <div className="border-t border-emerald-600/20 pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  Estimated Handoff Window: <strong>15-20 Mins Prior to Departure</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-border p-4 bg-background">
          {step === 1 && (
            <span className="text-xs text-muted-foreground italic">
              Search or pick a hub on map to proceed
            </span>
          )}

          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-6 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all cursor-pointer"
            >
              Continue to Step {step + 1} <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleCompleteAndProceed}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all hover:scale-[1.01] cursor-pointer"
            >
              Proceed to Medicine Selection <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
