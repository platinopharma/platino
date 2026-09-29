'use client';

import { useState } from 'react';
import {
  Pill,
  RefreshCw,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { type FamilyMemberData } from './AddFamilyMemberModal';

export interface PrescriptionItem {
  id: string;
  familyMemberId: string | null; // null = self
  patientName: string;
  relationship: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  daysRemaining: number;
  refillDueDate: string;
  status: 'DUE_SOON' | 'AUTO_REFILL' | 'OVERDUE' | 'NORMAL';
  doctorName: string;
  autoRefillEnabled: boolean;
}

const INITIAL_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: 'rx_101',
    familyMemberId: 'fam_parent_1',
    patientName: 'Sita Sharma',
    relationship: 'PARENT',
    medicineName: 'Metformin 500mg ER',
    dosage: '1 tablet twice daily',
    frequency: 'Daily (Morning / Evening)',
    daysRemaining: 3,
    refillDueDate: '2026-09-07',
    status: 'DUE_SOON',
    doctorName: 'Dr. A. K. Verma',
    autoRefillEnabled: true,
  },
  {
    id: 'rx_102',
    familyMemberId: 'fam_parent_1',
    patientName: 'Sita Sharma',
    relationship: 'PARENT',
    medicineName: 'Amlodipine 5mg',
    dosage: '1 tablet daily',
    frequency: 'Morning after food',
    daysRemaining: 2,
    refillDueDate: '2026-09-06',
    status: 'DUE_SOON',
    doctorName: 'Dr. A. K. Verma',
    autoRefillEnabled: true,
  },
  {
    id: 'rx_103',
    familyMemberId: null,
    patientName: 'Self (Account Holder)',
    relationship: 'SELF',
    medicineName: 'Multivitamin Gold Plus',
    dosage: '1 capsule daily',
    frequency: 'After lunch',
    daysRemaining: 18,
    refillDueDate: '2026-09-22',
    status: 'NORMAL',
    doctorName: 'Dr. Meera Rao',
    autoRefillEnabled: false,
  },
  {
    id: 'rx_104',
    familyMemberId: 'fam_child_1',
    patientName: 'Aarav Sharma',
    relationship: 'CHILD',
    medicineName: 'Montair LC Kid Syrup',
    dosage: '5ml daily at bedtime',
    frequency: 'Night',
    daysRemaining: 0,
    refillDueDate: '2026-09-03',
    status: 'OVERDUE',
    doctorName: 'Dr. Rajesh Gupta (Pediatrician)',
    autoRefillEnabled: false,
  },
];

interface FamilyPrescriptionLockerProps {
  familyMembers: FamilyMemberData[];
}

export function FamilyPrescriptionLocker({ familyMembers }: FamilyPrescriptionLockerProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(INITIAL_PRESCRIPTIONS);
  const [activeFilter, setActiveFilter] = useState<string>('ALL'); // 'ALL' | 'SELF' | memberId
  const [refillLoadingId, setRefillLoadingId] = useState<string | null>(null);
  const [isBundleRefilling, setIsBundleRefilling] = useState(false);

  const router = useRouter();

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((p) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'SELF') return p.familyMemberId === null;
    return p.familyMemberId === activeFilter;
  });

  // Calculate upcoming due count across family
  const dueRefillCount = prescriptions.filter(
    (p) => p.status === 'DUE_SOON' || p.status === 'OVERDUE'
  ).length;

  const handleSingleRefill = (rxId: string) => {
    setRefillLoadingId(rxId);
    setTimeout(() => {
      setRefillLoadingId(null);
      router.push('/pharmacies?refill=true');
    }, 600);
  };

  const handleBundleRefill = () => {
    setIsBundleRefilling(true);
    setTimeout(() => {
      setIsBundleRefilling(false);
      router.push('/pharmacies?bundle_refill=true');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* 1-Tap "Family Bundle Refill" Checkout Banner */}
      {dueRefillCount > 0 && (
        <div className="rounded-3xl border border-primary/30 bg-primary/[0.05] p-6 shadow-soft text-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-0.5 text-[10px] font-bold text-primary mb-1">
                  1-TAP FAMILY REFILL ENGINE
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                  {dueRefillCount} Family Prescriptions Due for Refill
                </h3>
                <p className="text-xs text-muted-foreground">
                  Consolidate refills for Sita Sharma & Aarav Sharma into a single express delivery order.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBundleRefill}
              disabled={isBundleRefilling}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:opacity-95 text-primary-foreground font-medium px-6 py-3 text-xs shadow-soft transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
            >
              {isBundleRefilling ? (
                'Preparing Bundle Order...'
              ) : (
                <>
                  Bundle Refill Order <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={cn(
            'px-4 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0',
            activeFilter === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-surface-elevated border border-border text-muted-foreground hover:text-foreground'
          )}
        >
          All Family ({prescriptions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('SELF')}
          className={cn(
            'px-4 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0',
            activeFilter === 'SELF'
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-surface-elevated border border-border text-muted-foreground hover:text-foreground'
          )}
        >
          Self ({prescriptions.filter((p) => p.familyMemberId === null).length})
        </button>

        {familyMembers.map((m) => {
          const count = prescriptions.filter((p) => p.familyMemberId === m.id).length;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveFilter(m.id || 'ALL')}
              className={cn(
                'px-4 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0',
                activeFilter === m.id
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'bg-surface-elevated border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {m.fullName} ({count})
            </button>
          );
        })}
      </div>

      {/* Prescription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrescriptions.map((rx) => (
          <div
            key={rx.id}
            className="rounded-3xl border border-border bg-surface-elevated p-5 space-y-4 shadow-soft hover:border-primary/40 transition-all relative overflow-hidden"
          >
            {/* Header: Patient Name & Refill Status Pill */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{rx.patientName}</h4>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {rx.relationship}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold border',
                  rx.status === 'OVERDUE'
                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                    : rx.status === 'DUE_SOON'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    : 'bg-primary-soft text-primary border-primary/20'
                )}
              >
                {rx.status === 'OVERDUE' && <AlertCircle className="h-3 w-3" />}
                {rx.status === 'DUE_SOON' && <Clock className="h-3 w-3" />}
                {rx.status === 'NORMAL' && <CheckCircle2 className="h-3 w-3" />}
                {rx.status === 'OVERDUE'
                  ? 'Overdue'
                  : rx.status === 'DUE_SOON'
                  ? `Due in ${rx.daysRemaining} Days`
                  : 'Active'}
              </span>
            </div>

            {/* Medicine Specs & Doctor Info */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-foreground">{rx.medicineName}</h3>
              <p className="text-xs font-medium text-muted-foreground">{rx.dosage}</p>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {rx.frequency}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Refill: {rx.refillDueDate}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-[11px] text-muted-foreground truncate">
                Dr. {rx.doctorName}
              </span>

              <button
                type="button"
                onClick={() => handleSingleRefill(rx.id)}
                disabled={refillLoadingId === rx.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:opacity-95 text-primary-foreground font-medium px-5 py-2 text-xs shadow-soft transition-all cursor-pointer"
              >
                {refillLoadingId === rx.id ? (
                  'Refilling...'
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" /> Refill Now
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
