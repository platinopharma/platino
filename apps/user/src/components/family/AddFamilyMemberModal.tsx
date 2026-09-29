'use client';

import { useState } from 'react';
import { X, UserPlus, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FamilyMemberData {
  id?: string;
  fullName: string;
  relationship: 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'GRANDPARENT' | 'OTHER';
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  chronicConditions: string[];
  allergies: string[];
  emergencyContactPhone: string;
  isDependent: boolean;
}

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: FamilyMemberData) => void;
}

export function AddFamilyMemberModal({ isOpen, onClose, onAddMember }: AddFamilyMemberModalProps) {
  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState<FamilyMemberData['relationship']>('CHILD');
  const [dateOfBirth, setDateOfBirth] = useState('2015-06-12');
  const [gender, setGender] = useState<FamilyMemberData['gender']>('MALE');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [chronicConditionsInput, setChronicConditionsInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 43210');
  const [isDependent, setIsDependent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);

    const newMember: FamilyMemberData = {
      id: `fam_${Date.now()}`,
      fullName: fullName.trim(),
      relationship,
      dateOfBirth,
      gender,
      bloodGroup,
      chronicConditions: chronicConditionsInput.split(',').map((s) => s.trim()).filter(Boolean),
      allergies: allergiesInput.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyContactPhone: emergencyPhone.trim(),
      isDependent,
    };

    setTimeout(() => {
      onAddMember(newMember);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface-elevated text-foreground shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-background">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Family Profile Setup
              </span>
              <h3 className="font-display text-base font-bold text-foreground">
                Add New Family Member / Dependent
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Relationship *
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as any)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="SPOUSE">Spouse</option>
                <option value="CHILD">Child</option>
                <option value="PARENT">Parent</option>
                <option value="SIBLING">Sibling</option>
                <option value="GRANDPARENT">Grandparent</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Chronic Conditions (comma separated)
            </label>
            <input
              type="text"
              value={chronicConditionsInput}
              onChange={(e) => setChronicConditionsInput(e.target.value)}
              placeholder="e.g. Hypertension, Type 2 Diabetes"
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Known Allergies (comma separated)
            </label>
            <input
              type="text"
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa Drugs"
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="dependentCheck"
              checked={isDependent}
              onChange={(e) => setIsDependent(e.target.checked)}
              className="h-4 w-4 rounded-xs border-border text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="dependentCheck" className="text-xs font-medium text-foreground cursor-pointer select-none">
              Mark as Financial & Medical Dependent (Refills billed to Primary User)
            </label>
          </div>

          {/* Footer CTAs */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary hover:opacity-95 text-primary-foreground px-6 py-2.5 text-xs font-medium shadow-soft transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving Member...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Save Family Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
