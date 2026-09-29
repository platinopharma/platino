'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ShieldCheck,
  HeartPulse,
  Pill,
  Trash2,
  Plus,
  User,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { socketManager } from '@/lib/socket';
import { AddFamilyMemberModal, type FamilyMemberData } from '@/components/family/AddFamilyMemberModal';
import { FamilyPrescriptionLocker } from '@/components/family/FamilyPrescriptionLocker';

const INITIAL_MEMBERS: FamilyMemberData[] = [
  {
    id: 'fam_parent_1',
    fullName: 'Sita Sharma',
    relationship: 'PARENT',
    dateOfBirth: '1962-04-15',
    gender: 'FEMALE',
    bloodGroup: 'B+',
    chronicConditions: ['Hypertension', 'Diabetes Type 2'],
    allergies: ['Penicillin'],
    emergencyContactPhone: '+91 98765 12345',
    isDependent: true,
  },
  {
    id: 'fam_child_1',
    fullName: 'Aarav Sharma',
    relationship: 'CHILD',
    dateOfBirth: '2016-08-20',
    gender: 'MALE',
    bloodGroup: 'O+',
    chronicConditions: ['Asthma'],
    allergies: ['Dust', 'Peanuts'],
    emergencyContactPhone: '+91 98765 67890',
    isDependent: true,
  },
];

export default function FamilyPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberData[]>(INITIAL_MEMBERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnectedToSocket, setIsConnectedToSocket] = useState(false);

  // Connect to Socket.io WebSockets on component mount for real-time family updates
  useEffect(() => {
    const socket = socketManager.connect();
    setIsConnectedToSocket(socket.connected);

    const handleConnect = () => setIsConnectedToSocket(true);
    const handleDisconnect = () => setIsConnectedToSocket(false);

    const handleRefillAlert = (data: { message?: string }) => {
      toast.info(`Family Refill Notice: ${data?.message || 'A dependent prescription is due for refill'}`, {
        duration: 5000,
      });
    };

    const handleMemberUpdate = (data: { fullName?: string }) => {
      toast.success(`Family Profile Synced: ${data?.fullName || 'Profile updated'}`, {
        duration: 4000,
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('family:refill_alert', handleRefillAlert);
    socket.on('family:member_updated', handleMemberUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('family:refill_alert', handleRefillAlert);
      socket.off('family:member_updated', handleMemberUpdate);
    };
  }, []);

  const handleAddMember = (newMember: FamilyMemberData) => {
    setFamilyMembers((prev) => [newMember, ...prev]);
  };

  const handleDeleteMember = (id?: string) => {
    if (!id) return;
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/account" className="hover:text-foreground">Account</Link>
        <span>/</span>
        <span className="text-foreground">Family & Dependents</span>
      </nav>

      {/* Top Hero Banner - Matched to PlatinoPharma Card Theme */}
      <div className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8 shadow-soft relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="h-4 w-4" /> Platinum Shared Health Network
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 border border-emerald-500/20">
                <span className={cn("h-2 w-2 rounded-full", isConnectedToSocket ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                {isConnectedToSocket ? "Live WebSocket Sync Active" : "Socket Connecting..."}
              </div>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Family & Dependent Health Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Manage prescription lockers, automated refills, and emergency medical profiles for your parents, children, and dependents from a unified dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:opacity-95 text-primary-foreground font-medium px-6 py-3 text-xs shadow-soft transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="h-4 w-4" /> Add Family Member
          </button>
        </div>
      </div>

      {/* Member Profiles Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Linked Family Profiles ({familyMembers.length + 1})</h2>
              <p className="text-xs text-muted-foreground">Manage dependents and health information</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Primary User Card (Self) */}
          <div className="rounded-3xl border border-primary/30 bg-surface-elevated p-5 space-y-4 shadow-soft relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
                  ME
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Primary Account Holder</h3>
                  <span className="text-[10px] font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    SELF (ADMIN)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground pt-1">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span>Blood Group:</span>
                <span className="font-bold text-foreground">O+</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span>Active Prescriptions:</span>
                <span className="font-bold text-primary">1 Item</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Status:</span>
                <span className="font-bold text-foreground">Primary Payer</span>
              </div>
            </div>
          </div>

          {/* Added Family Members Cards */}
          {familyMembers.map((m) => (
            <div
              key={m.id}
              className="rounded-3xl border border-border bg-surface-elevated p-5 space-y-4 shadow-soft hover:border-primary/40 transition-all relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary font-bold text-sm">
                    {m.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{m.fullName}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {m.relationship}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteMember(m.id)}
                  className="rounded-full p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Remove Family Member"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Medical Specs & Tags */}
              <div className="space-y-2 text-xs text-muted-foreground pt-1">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span>Blood Group:</span>
                  <span className="font-bold text-foreground">{m.bloodGroup || 'N/A'}</span>
                </div>

                {m.chronicConditions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-foreground">Conditions:</span>
                    <div className="flex flex-wrap gap-1">
                      {m.chronicConditions.map((c) => (
                        <span key={c} className="text-[10px] bg-primary-soft text-primary font-semibold px-2.5 py-0.5 rounded-md">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {m.allergies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-foreground">Allergies:</span>
                    <div className="flex flex-wrap gap-1">
                      {m.allergies.map((a) => (
                        <span key={a} className="text-[10px] bg-destructive/10 text-destructive font-semibold px-2.5 py-0.5 rounded-md">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Quick Add Member Card Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-3xl border-2 border-dashed border-border hover:border-primary/60 bg-surface-elevated/40 hover:bg-primary-soft/30 p-6 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-foreground">Add Dependent / Member</span>
            <span className="text-xs text-muted-foreground">Setup spouse, parents or kids</span>
          </button>
        </div>
      </section>

      {/* Shared Family Prescription Locker & Refill Engine */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Shared Prescription Refill Locker</h2>
            <p className="text-xs text-muted-foreground">Active family medications & 1-tap refill triggers</p>
          </div>
        </div>

        <FamilyPrescriptionLocker familyMembers={familyMembers} />
      </section>

      {/* Add Member Modal */}
      <AddFamilyMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMember={handleAddMember}
      />
    </div>
  );
}
