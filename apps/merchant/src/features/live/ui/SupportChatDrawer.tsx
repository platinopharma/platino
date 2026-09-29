import React, { useEffect, useState, useRef } from 'react';
import { TypedSocket, socketManager } from '@/lib/socket';
import { Send, User, Bot, Clock, Headphones, Zap, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { SlideOver, Pill } from '@/features/live/ui';
import { Order, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/features/live/data';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  senderType: 'USER' | 'AGENT' | 'BOT' | 'SYSTEM';
  senderName: string;
  messageText: string;
  mediaUrls?: string[];
  createdAt: string;
}

interface SupportChatDrawerProps {
  open: boolean;
  onClose: () => void;
  order: (Order & { orderNumber: string }) | null;
}

export function SupportChatDrawer({ open, onClose, order }: SupportChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentMessageIds = useRef<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isCustomerOnline, setIsCustomerOnline] = useState(false);

  useEffect(() => {
    if (open && order) {
      window.dispatchEvent(new CustomEvent('support:drawer_opened'));

      const newSocket = socketManager.connect();
      setSocket(newSocket);

      const joinSupport = () => {
        console.log(`[SupportChatDrawer] Connected to socket for support`);
        newSocket.emit('support:join' as any, { orderId: order.id });
      };

      joinSupport();
      newSocket.on('connect', joinSupport);

      const handleMsg = (data: any) => {
        const incomingOrderId = String(data.orderId || '');
        const currentOrderId = String(order.id || '');
        if (incomingOrderId === currentOrderId) {
          const incomingMsg: ChatMessage = data.message;
          // Deduplicate: skip messages we already added optimistically
          if (sentMessageIds.current.has(incomingMsg.id)) {
            sentMessageIds.current.delete(incomingMsg.id);
            return;
          }
          setMessages(prev => [...prev, incomingMsg]);
        }
      };

      newSocket.on('support:message_received' as any, handleMsg);

      const handleTypingStart = (data: any) => {
        if (data && data.senderType === 'USER') setIsTyping(true);
      };
      const handleTypingStop = (data: any) => {
        if (data && data.senderType === 'USER') setIsTyping(false);
      };
      newSocket.on('support:typing_start' as any, handleTypingStart);
      newSocket.on('support:typing_stop' as any, handleTypingStop);

      newSocket.on('customer_presence' as any, (data: { isOnline: boolean }) => {
        setIsCustomerOnline(data.isOnline);
      });

      // Add a system welcome message
      setMessages([{
        id: 'sys-1',
        senderType: 'SYSTEM',
        senderName: 'System',
        messageText: `Support session started for order #${order.orderNumber}. You can now chat directly with the customer and support agents.`,
        createdAt: new Date().toISOString()
      }]);

      return () => {
        newSocket.off('connect', joinSupport);
        newSocket.off('support:message_received' as any, handleMsg);
        newSocket.off('support:typing_start' as any, handleTypingStart);
        newSocket.off('support:typing_stop' as any, handleTypingStop);
        newSocket.off('customer_presence' as any);
        // We do not disconnect the singleton, just remove listeners
      };
    } else {
      setMessages([]);
      setSocket(null);
      setIsCustomerOnline(false);
    }
  }, [open, order]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const textToSend = customMsg || input;
    if (!textToSend.trim() || !socket || !order) return;

    const newMessage: ChatMessage = {
      id: `merchant_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      senderType: 'AGENT', // Merchant acts as the pharmacy agent
      senderName: 'Pharmacy',
      messageText: textToSend.trim(),
      createdAt: new Date().toISOString()
    };

    // Track this ID so we don't show it twice if socket echoes it back
    sentMessageIds.current.add(newMessage.id);

    // Optimistically add to local state immediately
    setMessages(prev => [...prev, newMessage]);

    socket.emit('support:send_message' as any, {
      orderId: order.id,
      message: newMessage
    });

    if (!customMsg) setInput('');
  };

  if (!order) return null;

  return (
    <SlideOver open={open} onClose={onClose} title={`Support: ${order.orderNumber}`} width="max-w-md">
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#05110A] text-white">
        
        {/* Header */}
        <div className="p-4 border-b border-[#122B1C] bg-[#030B06] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm text-gray-400">Customer</span>
              {isCustomerOnline ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-900/50 text-[10px] font-medium text-emerald-400 tracking-wide uppercase">
                  <span className="size-1.5 rounded-full bg-emerald-500"></span>
                  Customer Online
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/30 border border-amber-900/30 text-[10px] font-medium text-amber-500/80 tracking-wide uppercase">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-50"></span>
                    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500"></span>
                  </span>
                  Waiting for customer...
                </span>
              )}
            </div>
            <div className="font-semibold text-gray-200">{order.customer.name}</div>
          </div>
          <Pill tone={ORDER_STATUS_TONE[order.status] || "muted"}>
            {ORDER_STATUS_LABEL[order.status] || order.status}
          </Pill>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        >
          {!isCustomerOnline && (
            <div className="bg-[#122B1C]/40 border border-[#122B1C] rounded-lg p-3 text-xs text-gray-400 text-center mb-4 leading-relaxed">
              Customer is not currently viewing this chat.<br/>
              Messages sent will be delivered when they open support.
            </div>
          )}
          {messages.map((msg, i) => {
            const isMerchant = msg.senderType === 'AGENT';
            const isBot = msg.senderType === 'BOT' || msg.senderType === 'SYSTEM';
            return (
              <div key={msg.id || i} className={cn("flex flex-col max-w-[85%]", isMerchant ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                  {msg.senderType === 'AGENT' && <span>You</span>}
                  {msg.senderType === 'USER' && <><User className="size-3" /> {msg.senderName || order.customer.name}</>}
                  {msg.senderType === 'BOT' && <><Bot className="size-3" /> System Bot</>}
                  {msg.senderType === 'SYSTEM' && <><Bot className="size-3" /> System</>}
                  <span>•</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div className={cn(
                  "px-3 py-2 rounded-xl text-sm",
                  isMerchant ? "bg-emerald-900/60 border border-emerald-700/50 text-emerald-100 rounded-tr-sm" : 
                  isBot ? "bg-gray-900/50 border border-gray-800 text-gray-400 text-xs italic rounded-tl-sm" :
                  "bg-[#091E13] border border-[#122B1C] text-gray-200 rounded-tl-sm"
                )}>
                  {msg.messageText}
                </div>
              </div>
            );
          })}
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#091E13] border border-[#122B1C] px-3 py-1.5 rounded-full w-fit">
              <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
              <span>Customer is typing...</span>
            </div>
          </div>
        )}

        {/* Quick Responses Panel */}
        <div className="border-t border-[#122B1C] bg-[#030B06] shrink-0">
          <button
            type="button"
            onClick={() => setShowQuickResponses(!showQuickResponses)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-gray-400 hover:text-gray-200 transition-colors bg-[#05110A]"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="size-3.5 text-emerald-500" />
              Quick Responses
            </span>
            {showQuickResponses ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
          </button>
          
          {showQuickResponses && (
            <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 bg-[#05110A]">
              {[
                "Your order is packed and awaiting pickup.",
                "Delivery rider is on the way.",
                "Please upload a valid prescription.",
                "We are looking into this delay right away."
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => {
                    handleSend(undefined, template);
                    setShowQuickResponses(false);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-300 bg-[#091E13] border border-[#122B1C] rounded hover:bg-[#122B1C] hover:text-white transition-colors text-left"
                >
                  {template}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-[#122B1C]">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  if (socket && order) {
                    socket.emit('support:typing_start' as any, { orderId: order.id, senderType: 'AGENT' });
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                      socket.emit('support:typing_stop' as any, { orderId: order.id, senderType: 'AGENT' });
                    }, 2000);
                  }
                }}
                placeholder="Type a message..."
                className="w-full bg-[#05110A] border border-[#122B1C] text-white text-sm rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:border-emerald-700/50 transition-colors placeholder:text-gray-600"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 grid place-items-center w-8 bg-emerald-900/50 text-emerald-400 rounded-full hover:bg-emerald-800 hover:text-emerald-200 disabled:opacity-50 disabled:hover:bg-emerald-900/50 disabled:hover:text-emerald-400 transition-colors"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </SlideOver>
  );
}
