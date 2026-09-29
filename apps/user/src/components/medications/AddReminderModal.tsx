'use client';

import { useState } from 'react';
import { X, Bell, Pill, Clock, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReminderData {
  id?: string;
  medicineName: string;
  frequency: 'Twice a day' | 'Once a day' | 'Three times a day' | 'As needed';
  mealRelation: 'Before Food' | 'After Food';
  notifyEnabled: boolean;
  reminderTimes: string[];
  stockDosesLeft: number;
}

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReminder: (reminder: ReminderData) => void;
}

export function AddReminderModal({ isOpen, onClose, onAddReminder }: AddReminderModalProps) {
  const [medicineName, setMedicineName] = useState('');
  const [frequency, setFrequency] = useState<ReminderData['frequency']>('Twice a day');
  const [mealRelation, setMealRelation] = useState<ReminderData['mealRelation']>('After Food');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('08:00');
  const [eveningTime, setEveningTime] = useState('20:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) return;

    setIsSubmitting(true);

    const newReminder: ReminderData = {
      id: `rem_${Date.now()}`,
      medicineName: medicineName.trim(),
      frequency,
      mealRelation,
      notifyEnabled,
      reminderTimes: frequency === 'Once a day' ? [morningTime] : [morningTime, eveningTime],
      stockDosesLeft: 10,
    };

    setTimeout(() => {
      onAddReminder(newReminder);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-gray-900">
              Add Reminder
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* SECTION: MEDICATION DETAILS */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Medication Details
            </div>

            {/* Medicine Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-800 focus:bg-white focus:outline-hidden transition-all"
              />
            </div>

            {/* Frequency Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-emerald-800 focus:bg-white focus:outline-hidden transition-all"
              >
                <option value="Twice a day">Twice a day</option>
                <option value="Once a day">Once a day</option>
                <option value="Three times a day">Three times a day</option>
                <option value="As needed">As needed</option>
              </select>
            </div>

            {/* Segmented Toggle: Meal Relation */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Meal Relation
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5">
                <button
                  type="button"
                  onClick={() => setMealRelation('Before Food')}
                  className={cn(
                    'rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                    mealRelation === 'Before Food'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Before Food
                </button>
                <button
                  type="button"
                  onClick={() => setMealRelation('After Food')}
                  className={cn(
                    'rounded-lg py-2 text-xs font-bold transition-all cursor-pointer',
                    mealRelation === 'After Food'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  After Food
                </button>
              </div>
            </div>
          </div>

          {/* SECTION: SMART REMINDERS */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Smart Reminders
              </div>
              {/* Emerald Active Toggle Switch */}
              <button
                type="button"
                onClick={() => setNotifyEnabled((prev) => !prev)}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
                  notifyEnabled ? 'bg-emerald-800' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                    notifyEnabled ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            <p className="text-xs text-gray-500">Get notified when it's time to take your dose</p>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
                <span className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Morning Slot</span>
                <input
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="w-full text-center font-bold text-gray-900 bg-transparent text-sm focus:outline-hidden"
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
                <span className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Evening Slot</span>
                <input
                  type="time"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                  className="w-full text-center font-bold text-gray-900 bg-transparent text-sm focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white py-3.5 px-6 font-semibold shadow-sm w-full transition-all cursor-pointer text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Reminder...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" /> Set Reminder
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
