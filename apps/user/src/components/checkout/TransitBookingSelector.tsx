'use client';

import { useState, useEffect } from "react";
import { Plane, Train, Bus, Home, UserCheck, UserPlus, MapPin, Search, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeliveryCategory = 'STANDARD' | 'AIRPORT' | 'TRAIN' | 'BUS';

export interface BeneficiaryDetails {
  type: 'SELF' | 'OTHER';
  recipientName: string;
  recipientPhone: string;
  alternatePhone?: string;
}

export interface TransitDetails {
  hubName: string;
  hubCode?: string;
  terminalOrPlatform?: string;
  coachOrSeatOrBay?: string;
  pnrOrFlightNo?: string;
  departureTime?: string;
}

export interface TransitBookingSelectorProps {
  userProfile?: { name: string; phone: string };
  onChange: (data: {
    deliveryCategory: DeliveryCategory;
    beneficiary: BeneficiaryDetails;
    transitDetails?: TransitDetails;
  }) => void;
}

const PRESET_HUBS: Record<'AIRPORT' | 'TRAIN' | 'BUS', Array<{ name: string; code: string; city: string }>> = {
  AIRPORT: [
    { name: "Rajiv Gandhi International Airport", code: "HYD", city: "Hyderabad" },
    { name: "Indira Gandhi International Airport", code: "DEL", city: "New Delhi" },
    { name: "Chhatrapati Shivaji Maharaj Airport", code: "BOM", city: "Mumbai" },
    { name: "Kempegowda International Airport", code: "BLR", city: "Bengaluru" },
  ],
  TRAIN: [
    { name: "Secunderabad Junction Railway Station", code: "SC", city: "Hyderabad" },
    { name: "Hyderabad Deccan (Nampally) Station", code: "HYB", city: "Hyderabad" },
    { name: "Kacheguda Railway Station", code: "KCG", city: "Hyderabad" },
    { name: "New Delhi Railway Station", code: "NDLS", city: "New Delhi" },
  ],
  BUS: [
    { name: "Mahatma Gandhi Bus Station (MGBS)", code: "MGBS", city: "Hyderabad" },
    { name: "Jubilee Bus Station (JBS)", code: "JBS", city: "Hyderabad" },
    { name: "Anand Vihar ISBT", code: "AVISBT", city: "New Delhi" },
    { name: "Kempegowda Bus Station (Majestic)", code: "KBS", city: "Bengaluru" },
  ]
};

export function TransitBookingSelector({ userProfile, onChange }: TransitBookingSelectorProps) {
  const [category, setCategory] = useState<DeliveryCategory>('STANDARD');

  // Beneficiary state
  const [beneficiaryType, setBeneficiaryType] = useState<'SELF' | 'OTHER'>('SELF');
  const [recipientName, setRecipientName] = useState(userProfile?.name || "Awais Nadeem");
  const [recipientPhone, setRecipientPhone] = useState(userProfile?.phone || "+91 98765 43210");
  const [alternatePhone, setAlternatePhone] = useState("");

  // Transit details state
  const [selectedHub, setSelectedHub] = useState<{ name: string; code: string } | null>(null);
  const [customHubName, setCustomHubName] = useState("");
  const [terminalOrPlatform, setTerminalOrPlatform] = useState("");
  const [coachOrSeatOrBay, setCoachOrSeatOrBay] = useState("");
  const [pnrOrFlightNo, setPnrOrFlightNo] = useState("");
  const [departureTime, setDepartureTime] = useState("");

  const userProfileName = userProfile?.name;
  const userProfilePhone = userProfile?.phone;

  useEffect(() => {
    if (beneficiaryType === 'SELF') {
      if (userProfileName) setRecipientName(userProfileName);
      if (userProfilePhone) setRecipientPhone(userProfilePhone);
    }
  }, [userProfileName, userProfilePhone, beneficiaryType]);

  // Sync back to parent
  useEffect(() => {
    const hubName = selectedHub ? selectedHub.name : customHubName;
    const transit: TransitDetails | undefined = category === 'STANDARD' ? undefined : {
      hubName: hubName || (category === 'AIRPORT' ? 'RGIA Airport' : category === 'TRAIN' ? 'Secunderabad Junction' : 'MGBS Bus Stand'),
      hubCode: selectedHub?.code || "",
      terminalOrPlatform,
      coachOrSeatOrBay,
      pnrOrFlightNo,
      departureTime
    };

    onChange({
      deliveryCategory: category,
      beneficiary: {
        type: beneficiaryType,
        recipientName: beneficiaryType === 'SELF' ? (userProfileName || recipientName) : recipientName,
        recipientPhone: beneficiaryType === 'SELF' ? (userProfilePhone || recipientPhone) : recipientPhone,
        alternatePhone: alternatePhone || undefined
      },
      transitDetails: transit
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, beneficiaryType, recipientName, recipientPhone, alternatePhone, selectedHub, customHubName, terminalOrPlatform, coachOrSeatOrBay, pnrOrFlightNo, departureTime, userProfileName, userProfilePhone]);

  return (
    <div className="space-y-6 rounded-3xl border border-border bg-surface-elevated p-6 shadow-soft">
      {/* 1. Mode Tabs */}
      <div>
        <label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider block mb-3">
          Select Delivery Mode
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { id: 'STANDARD', label: 'Standard Home', icon: Home },
            { id: 'AIRPORT', label: 'Airport', icon: Plane },
            { id: 'TRAIN', label: 'Train', icon: Train },
            { id: 'BUS', label: 'Bus', icon: Bus },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCategory(item.id as DeliveryCategory);
                if (item.id !== 'STANDARD' && PRESET_HUBS[item.id as keyof typeof PRESET_HUBS]?.length > 0) {
                  setSelectedHub(PRESET_HUBS[item.id as keyof typeof PRESET_HUBS][0]);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition-all cursor-pointer",
                category === item.id
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-border bg-background hover:border-primary/50 text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Beneficiary Selector ("For Me" vs "For Someone Else") */}
      <div className="pt-4 border-t border-border">
        <label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider block mb-3">
          Who is Receiving This Order?
        </label>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setBeneficiaryType('SELF')}
            className={cn(
              "flex items-center gap-2 rounded-2xl border p-3 text-xs font-semibold transition-all cursor-pointer",
              beneficiaryType === 'SELF'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            <UserCheck className="h-4 w-4" />
            <span>For Me (Self)</span>
          </button>

          <button
            type="button"
            onClick={() => setBeneficiaryType('OTHER')}
            className={cn(
              "flex items-center gap-2 rounded-2xl border p-3 text-xs font-semibold transition-all cursor-pointer",
              beneficiaryType === 'OTHER'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            <UserPlus className="h-4 w-4" />
            <span>For Someone Else</span>
          </button>
        </div>

        {/* Inputs for Beneficiary Details */}
        {beneficiaryType === 'OTHER' && (
          <div className="grid gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Recipient Full Name *</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Recipient Mobile Number *</label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground">Alternate Phone (Optional)</label>
              <input
                type="tel"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                placeholder="Optional emergency contact"
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Dynamic Transit Context Fields */}
      {category !== 'STANDARD' && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-primary tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Transit Station / Terminal Details
            </span>
          </div>

          {/* Preset Hub Selector */}
          {PRESET_HUBS[category as keyof typeof PRESET_HUBS] && (
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Select {category} Hub</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {PRESET_HUBS[category as keyof typeof PRESET_HUBS].map((hub) => (
                  <button
                    key={hub.code}
                    type="button"
                    onClick={() => {
                      setSelectedHub(hub);
                      setCustomHubName(hub.name);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      selectedHub?.code === hub.code
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50 text-foreground"
                    )}
                  >
                    {hub.name} ({hub.code})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Context Fields per Category */}
          <div className="grid gap-3 sm:grid-cols-2">
            {category === 'AIRPORT' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Terminal / Gate No.</label>
                  <input
                    type="text"
                    value={terminalOrPlatform}
                    onChange={(e) => setTerminalOrPlatform(e.target.value)}
                    placeholder="e.g. Terminal 1 / Gate 4B"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Flight Number</label>
                  <input
                    type="text"
                    value={pnrOrFlightNo}
                    onChange={(e) => setPnrOrFlightNo(e.target.value)}
                    placeholder="e.g. AI-542 / 6E-204"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Boarding / Departure Time</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </>
            )}

            {category === 'TRAIN' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Platform Number</label>
                  <input
                    type="text"
                    value={terminalOrPlatform}
                    onChange={(e) => setTerminalOrPlatform(e.target.value)}
                    placeholder="e.g. Platform 4"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Coach & Seat / Berth</label>
                  <input
                    type="text"
                    value={coachOrSeatOrBay}
                    onChange={(e) => setCoachOrSeatOrBay(e.target.value)}
                    placeholder="e.g. Coach B3 / Seat 24"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Train / PNR Number</label>
                  <input
                    type="text"
                    value={pnrOrFlightNo}
                    onChange={(e) => setPnrOrFlightNo(e.target.value)}
                    placeholder="e.g. 12723 / PNR 4829104820"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </>
            )}

            {category === 'BUS' && (
              <>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Platform / Bay Number</label>
                  <input
                    type="text"
                    value={terminalOrPlatform}
                    onChange={(e) => setTerminalOrPlatform(e.target.value)}
                    placeholder="e.g. Bay 14"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Bus Reg / Ticket No.</label>
                  <input
                    type="text"
                    value={pnrOrFlightNo}
                    onChange={(e) => setPnrOrFlightNo(e.target.value)}
                    placeholder="e.g. TS09Z1234 / Ticket #9482"
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
