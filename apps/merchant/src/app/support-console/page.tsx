'use client';

import { useState, useEffect } from 'react';
import {
  Headphones,
  Send,
  UserCheck,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
  Phone,
  FileText,
  DollarSign,
  Package,
  XCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SupportQueueTicket {
  ticketId: string;
  customerName: string;
  orderId: string;
  issueType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'QUEUED' | 'AGENT_ASSIGNED' | 'BOT_HANDLING' | 'RESOLVED';
  waitTime: string;
  unreadCount: number;
}

const INITIAL_QUEUE: SupportQueueTicket[] = [
  {
    ticketId: 'TKT-90412',
    customerName: 'Awais Nadeem',
    orderId: 'ORD-84632056',
    issueType: 'DAMAGED_ITEM',
    priority: 'CRITICAL',
    status: 'QUEUED',
    waitTime: '45s',
    unreadCount: 2,
  },
  {
    ticketId: 'TKT-88319',
    customerName: 'Priya Sharma',
    orderId: 'ORD-77192304',
    issueType: 'DELAYED_DELIVERY',
    priority: 'HIGH',
    status: 'QUEUED',
    waitTime: '2m 10s',
    unreadCount: 1,
  },
  {
    ticketId: 'TKT-71045',
    customerName: 'Ramesh Verma',
    orderId: 'ORD-65239102',
    issueType: 'PAYMENT_ISSUE',
    priority: 'MEDIUM',
    status: 'AGENT_ASSIGNED',
    waitTime: '4m 05s',
    unreadCount: 0,
  },
];

const CANNED_RESPONSES = [
  'Our express delivery rider is currently 2 minutes away from your location.',
  'We have initiated an instant refund of ₹145 to your original payment method.',
  'A replacement medicine strip has been dispatched via priority courier.',
  'Thank you for verifying! Your order details have been updated.',
];

interface ChatMessage {
  sender: 'USER' | 'AGENT' | 'SYSTEM';
  name?: string;
  text: string;
  time: string;
}

export default function AgentSupportConsolePage() {
  const [queue, setQueue] = useState<SupportQueueTicket[]>(INITIAL_QUEUE);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('TKT-90412');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'USER',
      name: 'Awais Nadeem',
      text: 'My Paracetamol strip arrived damaged. The outer foil package is torn.',
      time: '10:02 AM',
    },
    {
      sender: 'SYSTEM',
      text: 'Ticket escalated to Live Support Queue. Agent Rahul connected.',
      time: '10:03 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const activeTicket = queue.find((t) => t.ticketId === selectedTicketId) || queue[0];

  const handleSendAgentReply = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'AGENT',
        name: 'Agent Rahul (You)',
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    if (!textToSend) setInputText('');
  };

  const handleAction = (actionName: string) => {
    toast.success(`Action Executed: ${actionName}`);
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'SYSTEM',
        text: `Action executed by Agent Rahul: [ ${actionName} ]`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-900 text-white font-bold">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">
              Live Customer Support Console
            </h1>
            <p className="text-xs text-gray-500">
              Real-time ticket queue & instant dispatch control desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-900">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" /> Active Agent: Rahul (Senior)
          </span>
        </div>
      </div>

      {/* Main Console Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left Queue Sidebar */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4 flex flex-col space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Incoming Queue ({queue.length})
            </h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              {queue.filter((q) => q.priority === 'CRITICAL' || q.priority === 'HIGH').length} Urgent
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5">
            {queue.map((t) => (
              <button
                key={t.ticketId}
                type="button"
                onClick={() => setSelectedTicketId(t.ticketId)}
                className={cn(
                  'w-full rounded-xl p-3 text-left border transition-all cursor-pointer space-y-1.5',
                  selectedTicketId === t.ticketId
                    ? 'border-emerald-800 bg-emerald-50/60 shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{t.ticketId}</span>
                  <span
                    className={cn(
                      'text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider',
                      t.priority === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : t.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    )}
                  >
                    {t.priority}
                  </span>
                </div>

                <div className="text-xs font-semibold text-gray-800 truncate">{t.customerName}</div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-800" /> {t.waitTime}
                  </span>
                  <span className="font-mono text-gray-600">#{t.orderId}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center Live Support Chat Workspace */}
        <div className="lg:col-span-5 rounded-2xl border border-gray-200 bg-white flex flex-col shadow-sm overflow-hidden">
          {/* Active Ticket Header */}
          <div className="bg-gray-900 text-white p-3.5 px-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">{activeTicket.ticketId}</span>
                <span className="text-[10px] font-mono bg-gray-800 px-2 py-0.5 rounded-md text-gray-300">
                  #{activeTicket.orderId}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeTicket.customerName}</h4>
            </div>

            <button
              type="button"
              onClick={() => handleAction('Close Ticket')}
              className="rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              Resolve Ticket
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {chatMessages.map((m, idx) => {
              if (m.sender === 'SYSTEM') {
                return (
                  <div key={idx} className="text-center my-2">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-900">
                      {m.text}
                    </span>
                  </div>
                );
              }

              const isAgent = m.sender === 'AGENT';
              return (
                <div
                  key={idx}
                  className={cn('flex flex-col max-w-[85%]', isAgent ? 'ml-auto items-end' : 'mr-auto items-start')}
                >
                  <span className="text-[10px] font-bold text-gray-400 mb-1">{m.name}</span>
                  <div
                    className={cn(
                      'p-3 text-xs leading-relaxed shadow-xs',
                      isAgent
                        ? 'bg-emerald-900 text-white rounded-2xl rounded-tr-xs'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-xs'
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canned Quick Replies Drawer */}
          <div className="p-2.5 bg-gray-100 border-t border-gray-200 space-y-1.5">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 px-1">
              <Sparkles className="h-3 w-3 text-emerald-800" /> One-Tap Canned Responses:
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CANNED_RESPONSES.map((rsp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendAgentReply(rsp)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-800 hover:border-emerald-800 hover:bg-emerald-50 transition-all cursor-pointer shrink-0 truncate max-w-[220px]"
                >
                  {rsp}
                </button>
              ))}
            </div>
          </div>

          {/* Reply Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAgentReply();
            }}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type agent response..."
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-900 focus:border-emerald-800 focus:bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white p-2.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Order Context & Instant Action Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 space-y-5 shadow-sm overflow-y-auto">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
            Order & Customer Context
          </div>

          {/* Order Details */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-gray-900">
              <span>Order ID:</span>
              <span className="font-mono text-emerald-900">#{activeTicket.orderId}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Pharmacy:</span>
              <span className="font-semibold text-gray-900">Sri Sai Medicals</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Items Total:</span>
              <span className="font-bold text-gray-900">₹145 (1 Item)</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-800">PAID (UPI)</span>
            </div>
          </div>

          {/* One-Tap Agent Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Instant Agent Actions
            </div>

            <button
              type="button"
              onClick={() => handleAction('Instant Refund ₹145')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-3 px-4 text-xs shadow-xs transition-all cursor-pointer"
            >
              <DollarSign className="h-4 w-4" /> Issue Full Refund (₹145)
            </button>

            <button
              type="button"
              onClick={() => handleAction('Express Redispatch')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 text-xs shadow-xs transition-all cursor-pointer"
            >
              <Package className="h-4 w-4 text-emerald-800" /> Redispatch Replacement Order
            </button>

            <button
              type="button"
              onClick={() => handleAction('Close Support Ticket')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-900 font-semibold py-3 px-4 text-xs shadow-xs transition-all cursor-pointer"
            >
              <XCircle className="h-4 w-4 text-red-700" /> Close & Resolve Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
