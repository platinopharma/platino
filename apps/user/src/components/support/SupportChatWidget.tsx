'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Send,
  Paperclip,
  Phone,
  ShieldCheck,
  Truck,
  Pill,
  CreditCard,
  UserCheck,
  CheckCheck,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { socketManager } from '@/lib/socket';
import { apiGet, apiPost } from '@/lib/axios';

export interface ChatMessage {
  id: string;
  senderType: 'USER' | 'AGENT' | 'BOT' | 'SYSTEM';
  senderName: string;
  messageText: string;
  mediaUrls?: string[];
  actionPayload?: {
    type: string;
    orderId?: string;
    [key: string]: any;
  };
  createdAt: string;
}

interface SupportChatWidgetProps {
  ticketId: string;
  orderId?: string;
  pharmacyName?: string;
  initialStatus?: string;
}

export function SupportChatWidget({ ticketId, orderId = 'ORD-84632056', pharmacyName, initialStatus = 'AGENT_ASSIGNED' }: SupportChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      senderType: 'SYSTEM',
      senderName: 'SYSTEM',
      messageText: `Support session started for order #${orderId}. You can now chat directly with the support agents.`,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [ticketStatus, setTicketStatus] = useState<string>(initialStatus);
  const [agentName, setAgentName] = useState<string | null>(pharmacyName ? `${pharmacyName} Support` : 'Support Specialist');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sentMessageIds = useRef<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Socket.io Real-Time Event Subscription & Room Joining
  useEffect(() => {
    if (!ticketId) return;
    const socket = socketManager.connect();
    const roomName = `support_${ticketId}`;

    const joinSupport = () => {
      socket.emit('join-support-room', { ticketId, roomName });
    };
    joinSupport();
    socket.on('connect', joinSupport);

    const handleReceiveMsg = (newMsg: ChatMessage) => {
      // Deduplicate: skip messages we already added optimistically
      if (sentMessageIds.current.has(newMsg.id)) {
        sentMessageIds.current.delete(newMsg.id);
        return;
      }
      setMessages((prev) => [...prev, newMsg]);
    };

    const handleTypingStart = (data?: any) => {
      if (data && data.senderType === 'USER') return;
      setIsTyping(true);
    };
    const handleTypingStop = (data?: any) => {
      if (data && data.senderType === 'USER') return;
      setIsTyping(false);
    };
    const handleAgentAssigned = (data: { agentName: string }) => {
      setTicketStatus('AGENT_ASSIGNED');
      setAgentName(data?.agentName || 'Agent Rahul (Senior Specialist)');
      toast.success(`Connected with ${data?.agentName || 'Support Specialist Agent Rahul'}`);
    };

    socket.on('support:receive_message', handleReceiveMsg);
    socket.on('support:typing_start', handleTypingStart);
    socket.on('support:typing_stop', handleTypingStop);
    socket.on('support:agent_assigned', handleAgentAssigned);

    return () => {
      socket.off('connect', joinSupport);
      socket.off('support:receive_message', handleReceiveMsg);
      socket.off('support:typing_start', handleTypingStart);
      socket.off('support:typing_stop', handleTypingStop);
      socket.off('support:agent_assigned', handleAgentAssigned);
      socket.emit('leave-support-room', { ticketId, roomName });
    };
  }, [ticketId]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderType: 'USER',
      senderName: 'You',
      messageText: textToSend.trim(),
      mediaUrls: attachedImage ? [attachedImage] : [],
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedImage(null);

    // Track this message ID so we don't show it again when the socket echoes it back
    sentMessageIds.current.add(userMsg.id);

    try {
      await apiPost(`/api/v1/support/tickets/${ticketId}/messages`, {
        senderType: 'USER',
        senderName: 'You',
        messageText: userMsg.messageText,
        mediaUrls: userMsg.mediaUrls,
        orderId: orderId, // Pass orderId so the backend can link it
      });

      // Broadcast via socket
      const socket = socketManager.getSocket();
      socket?.emit('support:send_message', { ticketId, orderId, message: userMsg });
    } catch (err) {
      console.error('Failed to post support message', err);
    }
  };

  const handleBotQuickAction = async (actionType: string, label: string) => {
    // Add user click message
    const userChoiceMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderType: 'USER',
      senderName: 'You',
      messageText: label,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userChoiceMsg]);
    setIsTyping(true);

    try {
      const res = await apiPost<{ data?: { message?: ChatMessage; ticket?: { status?: string } } }>(`/api/v1/support/tickets/${ticketId}/bot-action`, {
        actionType,
        orderId: orderId, // Pass orderId so backend can link it
      });
      setIsTyping(false);

      if (res.data?.message) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
      }
      if (res.data?.ticket?.status) {
        setTicketStatus(res.data.ticket.status);
      }
    } catch (err) {
      setIsTyping(false);
      toast.error('Failed to process quick action');
    }
  };

  const handleEscalateToHuman = async () => {
    setIsTyping(true);
    try {
      const res = await apiPost<{ data?: { message?: ChatMessage } }>(`/api/v1/support/tickets/${ticketId}/escalate`, {});
      setIsTyping(false);
      setTicketStatus('QUEUED');

      if (res.data?.message) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
      }

      toast.info('Escalated to live agent queue. An agent will connect shortly!');

      // Simulate live agent connecting after 3 seconds if demo
      setTimeout(() => {
        setTicketStatus('AGENT_ASSIGNED');
        setAgentName('Agent Rahul (Senior Specialist)');
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_agent_${Date.now()}`,
            senderType: 'AGENT',
            senderName: 'Agent Rahul',
            messageText: `Hello! I am Agent Rahul from Platino Priority Support. I have reviewed your order #${orderId} and I am ready to resolve your request immediately.`,
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 3000);
    } catch (err) {
      setIsTyping(false);
    }
  };

  const handleMockImageUpload = () => {
    setAttachedImage('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300');
    toast.success('Prescription / Damaged Medicine Photo attached');
  };

  const handleCancelOrder = async (targetOrderId?: string) => {
    setIsTyping(true);
    try {
      await apiPost('/api/v1/support/cancel-order', {
        orderId: targetOrderId || orderId
      });
      toast.success('Order cancelled successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col h-[650px] max-w-2xl mx-auto">
      {/* Context-Aware Chat Header */}
      <div className="bg-emerald-950 text-white p-4 border-b border-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-800 text-white">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                {ticketId}
              </span>
              <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded-md font-mono text-emerald-200">
                #{orderId}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              {ticketStatus === 'AGENT_ASSIGNED' ? (
                <>
                  <UserCheck className="h-4 w-4 text-emerald-400" /> {agentName || 'Agent Rahul'}
                </>
              ) : ticketStatus === 'QUEUED' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> Waiting for Live Agent...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Platino Support Assistant
                </>
              )}
            </h3>
          </div>
        </div>

        <a
          href="tel:+911800123456"
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
        >
          <Phone className="h-3.5 w-3.5 text-white" /> Call Support
        </a>
      </div>

      {/* Live Message Thread Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((msg) => {
          const isUser = msg.senderType === 'USER';
          const isSystem = msg.senderType === 'SYSTEM';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1 text-[11px] font-bold text-emerald-900 shadow-xs">
                  {msg.messageText}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={cn('flex flex-col max-w-[80%]', isUser ? 'ml-auto items-end' : 'mr-auto items-start')}
            >
              <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">
                {msg.senderName}
              </span>

              <div
                className={cn(
                  'p-3.5 text-xs leading-relaxed space-y-2 shadow-xs',
                  isUser
                    ? 'bg-emerald-800 text-white rounded-2xl rounded-tr-xs'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-xs'
                )}
              >
                <p>{msg.messageText}</p>

                {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                  <div className="pt-2">
                    <img
                      src={msg.mediaUrls[0]}
                      alt="Attachment"
                      className="rounded-xl max-h-40 object-cover border border-gray-200"
                    />
                  </div>
                )}

                {msg.actionPayload?.type === 'CANCEL_ORDER_PROMPT' && !isUser && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(msg.actionPayload?.orderId)}
                      className="w-full text-center rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 px-4 transition-colors border border-red-200 shadow-xs"
                    >
                      Confirm Order Cancellation
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator Animation */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl w-fit">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-800" />
            <span>Pharmacy agent is typing...</span>
          </div>
        )}



        <div ref={messagesEndRef} />
      </div>

      {/* Attached Image Preview */}
      {attachedImage && (
        <div className="bg-gray-100 p-2 px-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <ImageIcon className="h-4 w-4 text-emerald-800" /> Photo attached for proof
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick Reply Chips */}
      {messages.length < 3 && (
        <div className="bg-white border-t border-gray-200 p-2.5 overflow-x-auto whitespace-nowrap scrollbar-hide flex items-center gap-2 px-3">
          {["Where is my order?", "Wrong medicine received", "Expected delivery time?", "Want to cancel order"].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendMessage(undefined, chip)}
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-[11px] font-semibold text-gray-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-900 transition-colors shadow-xs"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <button
          type="button"
          onClick={handleMockImageUpload}
          className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
          title="Attach Medicine Photo"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            const socket = socketManager.getSocket();
            if (socket) {
              socket.emit('support:typing_start', { ticketId, orderId, senderType: 'USER' });
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                socket.emit('support:typing_stop', { ticketId, orderId, senderType: 'USER' });
              }, 2000);
            }
          }}
          placeholder="Type your message here..."
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-900 focus:border-emerald-800 focus:bg-white focus:outline-hidden transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !attachedImage}
          className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white p-2.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
