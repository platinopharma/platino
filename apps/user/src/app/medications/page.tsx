'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Pill,
  Clock,
  ShieldCheck,
  ChevronRight,
  Plus,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { socketManager } from '@/lib/socket';
import { AddReminderModal, type ReminderData } from '@/components/medications/AddReminderModal';
import { SmartRefillModal } from '@/components/medications/SmartRefillModal';

const INITIAL_REMINDERS: ReminderData[] = [
  {
    id: 'rem_1',
    medicineName: 'Amoxicillin 500mg',
    frequency: 'Twice a day',
    mealRelation: 'After Food',
    notifyEnabled: true,
    reminderTimes: ['08:00', '20:00'],
    stockDosesLeft: 2, // Low stock trigger
  },
  {
    id: 'rem_2',
    medicineName: 'Metformin 500mg ER',
    frequency: 'Twice a day',
    mealRelation: 'After Food',
    notifyEnabled: true,
    reminderTimes: ['08:00', '20:00'],
    stockDosesLeft: 14,
  },
  {
    id: 'rem_3',
    medicineName: 'Paracetamol 650mg',
    frequency: 'As needed',
    mealRelation: 'After Food',
    notifyEnabled: false,
    reminderTimes: ['14:00'],
    stockDosesLeft: 8,
  },
];

export default function MedicationsPage() {
  const [reminders, setReminders] = useState<ReminderData[]>(INITIAL_REMINDERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [selectedRefillMedicine, setSelectedRefillMedicine] = useState<string>('Amoxicillin 500mg - Strip of 10 capsules');
  const [isConnectedToSocket, setIsConnectedToSocket] = useState(false);

  // Connect to Socket.io WebSockets
  useEffect(() => {
    const socket = socketManager.connect();
    setIsConnectedToSocket(socket.connected);

    const handleConnect = () => setIsConnectedToSocket(true);
    const handleDisconnect = () => setIsConnectedToSocket(false);

    const handleReminderPush = (data: { body?: string }) => {
      toast.info(`Time for your dose: ${data?.body || 'Take your medication'}`, {
        duration: 5000,
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('medication:reminder', handleReminderPush);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('medication:reminder', handleReminderPush);
    };
  }, []);

  const handleAddReminder = (newRem: ReminderData) => {
    setReminders((prev) => [newRem, ...prev]);
    toast.success(`Reminder set for ${newRem.medicineName}`);
  };

  const handleDeleteReminder = (id?: string) => {
    if (!id) return;
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast.success('Reminder removed');
  };

  const handleConfirmSmartRefill = (orderDetails: { orderId: string }) => {
    toast.success(`Smart Refill Order Placed! Order ID: ${orderDetails.orderId}`, {
      description: 'Sri Sai Medicals is preparing your prescription for express delivery.',
    });

    // Update stock for low stock item
    setReminders((prev) =>
      prev.map((r) => (r.stockDosesLeft <= 2 ? { ...r, stockDosesLeft: 14 } : r))
    );
  };

  const lowStockItem = reminders.find((r) => r.stockDosesLeft <= 2);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Medication Reminders & Schedule</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <Bell className="h-4 w-4 text-emerald-800" /> Daily Medication Schedule
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-100">
              <span className={cn("h-2 w-2 rounded-full", isConnectedToSocket ? "bg-emerald-600 animate-pulse" : "bg-gray-400")} />
              {isConnectedToSocket ? "Live Notification Sync Active" : "Connecting..."}
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Medication Reminders & Smart Refills
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
            Never miss a dose with automated meal-time reminders and 1-tap smart refills when stock gets low.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-6 py-3.5 text-xs shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Reminder
        </button>
      </div>

      {/* Low Stock Smart Refill Alert Trigger Banner */}
      {lowStockItem && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md mb-1">
                Low Stock Alert (2 Doses Left)
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                {lowStockItem.medicineName} is almost finished!
              </h3>
              <p className="text-xs text-gray-600">
                Trigger a 1-tap Smart Refill using your valid prescription on file.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedRefillMedicine(`${lowStockItem.medicineName} - Strip of 10 capsules`);
              setIsRefillModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-5 py-2.5 text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="h-4 w-4" /> Smart Refill Now (₹145)
          </button>
        </div>
      )}

      {/* Daily Reminders List */}
      <section className="space-y-4">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Active Medication Reminders ({reminders.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm hover:border-emerald-800/40 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{rem.medicineName}</h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {rem.mealRelation}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="rounded-xl p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Reminder"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-semibold">Frequency:</span>
                  <span className="font-bold text-gray-900">{rem.frequency}</span>
                </div>

                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-semibold">Scheduled Slots:</span>
                  <div className="flex gap-1.5">
                    {rem.reminderTimes.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 bg-gray-100 text-gray-900 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        <Clock className="h-3 w-3 text-emerald-800" /> {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-gray-600 pt-1 border-t border-gray-100">
                  <span className="font-semibold">Stock Remaining:</span>
                  <span className={cn("font-bold px-2 py-0.5 rounded-md text-[11px]", rem.stockDosesLeft <= 2 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>
                    {rem.stockDosesLeft} Doses Left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      <AddReminderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddReminder={handleAddReminder}
      />

      <SmartRefillModal
        isOpen={isRefillModalOpen}
        onClose={() => setIsRefillModalOpen(false)}
        onConfirmRefill={handleConfirmSmartRefill}
        medicineTitle={selectedRefillMedicine}
        price={145}
      />
    </div>
  );
}
