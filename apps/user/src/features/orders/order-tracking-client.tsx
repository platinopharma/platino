'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Check,
  Phone,
  PhoneCall,
  MapPin,
  Download,
  XCircle,
  FileText,
  Wallet,
  ShieldCheck,
  Truck,
  UserCheck,
  KeyRound,
  Copy,
  Headphones,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatINR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { apiGet, apiPost } from '@/lib/axios';
import { socketManager } from '@/lib/socket';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

const timeline = [
  { key: 'PRESCRIPTION_UPLOADED', label: 'Order Initiated', hint: 'Details submitted successfully' },
  { key: 'AWAITING_PHARMACY_VERIFICATION', label: 'Awaiting Verification', hint: 'Pharmacist will review shortly' },
  { key: 'PAYMENT_PENDING', label: 'Ready for Payment', hint: 'Please complete your payment' },
  { key: 'PAYMENT_COMPLETED', label: 'Payment Confirmed', hint: 'Pharmacy notified' },
  { key: 'PREPARING', label: 'Preparing your order', hint: 'Packing your items now' },
  { key: 'IN_TRANSIT', label: 'Out for delivery', hint: 'Rider is on the way' },
  { key: 'DELIVERED', label: 'Delivered', hint: 'Enjoy!' },
];

function getActiveTimelineIndex(status: string): number {
  const normalized = (status || '').toUpperCase();
  switch (normalized) {
    case 'DRAFT':
    case 'PRESCRIPTION_UPLOADED':
      return 0;
    case 'PLACED':
    case 'AWAITING_PHARMACY_VERIFICATION':
      return 1;
    case 'ACCEPTED':
    case 'PAYMENT_PENDING':
      return 2;
    case 'PAYMENT_COMPLETED':
      return 3;
    case 'PREPARING':
    case 'PACKED':
      return 4;
    case 'IN_TRANSIT':
    case 'OUT_FOR_DELIVERY':
      return 5;
    case 'ARRIVED_AT_CUSTOMER':
      return 5; // same stage conceptually for the timeline, or could be 6
    case 'DELIVERED':
      return 6;
    default:
      return 0;
  }
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as { Razorpay?: unknown }).Razorpay) return resolve(true);

    const existingScript = document.getElementById('razorpay-sdk');
    if (existingScript) {
      if ((window as { Razorpay?: unknown }).Razorpay) return resolve(true);
      existingScript.addEventListener('load', () => resolve(true));
      setTimeout(() => resolve(!!(window as { Razorpay?: unknown }).Razorpay), 800);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

interface OrderItem {
  id?: string;
  _id?: string;
  productId: string;
  medicineId?: string;
  medicineName: string;
  quantity: number;
  unitType?: string;
  price: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface OrderDetails {
  _id?: string;
  id?: string;
  orderNumber?: string;
  orderStatus?: string;
  paymentStatus?: string;
  totalAmount?: number;
  subtotal?: number;
  total?: number;
  deliveryFee?: number;
  customerName?: string;
  customerPhone?: string;
  createdAt?: string;
  deliveryAddress?: string | {
    street?: string;
    line1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  items?: OrderItem[];
  rider?: {
    name?: string;
    phone?: string;
    vehicleNumber?: string;
    location?: { lat: number; lng: number };
  };
  deliveryOtp?: string;
  pharmacyName?: string;
  pharmacistNotes?: string;
}


export function OrderTrackingClient({ orderId }: { orderId: string }) {
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [acknowledgingPolicy, setAcknowledgingPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // FIX: Configured React Query with deduping and no polling interval to eliminate request flooding
  const { data: order, isLoading, error, refetch } = useQuery<OrderDetails>({
    queryKey: ['customer-order', orderId],
    queryFn: async () => {
      const res = await apiGet<{ data?: OrderDetails } | OrderDetails>(`/api/customer/v1/orders/${orderId}`);
      if ('data' in res && res.data) return res.data;
      return res as OrderDetails;
    },
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // FIX: Socket.io Connection & Clean Lifecycle Cleanup Function
  useEffect(() => {
    if (!orderId) return;
    try {
      const socket = socketManager.connect();

      const joinRoom = () => socket.emit('join_order_room', { orderId });
      joinRoom(); // initial join
      socket.on('connect', joinRoom); // re-join on reconnect

      const handleSync = (data: any) => {
        if (!data || (data.orderNumber !== orderId && data.orderId !== orderId)) return;

        console.log("Socket Sync Triggered:", data);
        const statusLabel = data.status ? data.status.replace(/_/g, ' ') : 'updated';

        toast(`Order is now ${statusLabel}`, {
          icon: <Check className="size-4 text-emerald-500" />,
          className: "bg-background text-foreground border-border",
        });
        refetch();
      };

      socket.on('transit-updated', handleSync);
      socket.on('order_status_updated', handleSync);

      return () => {
        socket.off('connect', joinRoom);
        socket.off('transit-updated', handleSync);
        socket.off('order_status_updated', handleSync);
        socket.emit('leave_order_room', { orderId });
      };
    } catch (e) {
      console.warn('Socket connection warning:', e);
    }
  }, [orderId, refetch]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading order details…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Order not found</h1>
      </div>
    );
  }

  const oStatus = order?.orderStatus || 'PENDING';
  const isCancelled = oStatus === 'CANCELLED' || oStatus === 'REJECTED';
  const isDelivered = oStatus === 'DELIVERED';
  const isPaymentPending =
    order.orderStatus === 'PAYMENT_PENDING' ||
    (order.orderStatus === 'ACCEPTED' && order.paymentStatus === 'PENDING');
  const isOutForDelivery =
    order.orderStatus === 'OUT_FOR_DELIVERY' || order.orderStatus === 'IN_TRANSIT';
  const isArrivedAtCustomer = order.orderStatus === 'ARRIVED_AT_CUSTOMER';
  const hasAcknowledgedPolicy = !!order.deliveryOtp;

  // Rider details fallback data for display
  const riderInfo = order.rider || {
    name: 'Vikram Singh',
    phone: '+91 98765 43210',
    vehicleNumber: 'TS 09 EQ 8492',
  };
  const deliveryPin = order.deliveryOtp;

  const handleAcknowledgePolicy = async () => {
    setAcknowledgingPolicy(true);
    try {
      await apiPost(`/api/customer/v1/orders/${orderId}/acknowledge-policy`, {
        policyVersion: 'v1.0-standard-no-returns'
      });
      toast.success('Policy acknowledged. Delivery PIN generated.');
      refetch();
    } catch (e: unknown) {
      toast.error((e as any)?.response?.data?.error || 'Failed to acknowledge policy');
    } finally {
      setAcknowledgingPolicy(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await apiPost(`/api/customer/v1/orders/${orderId}/cancel`, {});
      toast.success('Order cancelled successfully');
      refetch();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyOtp = () => {
    if (!deliveryPin) return;
    navigator.clipboard.writeText(deliveryPin);
    setCopiedOtp(true);
    toast.success('Delivery OTP copied to clipboard');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handlePayNow = async () => {
    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !(window as { Razorpay?: unknown }).Razorpay) {
        toast.error('Unable to load Razorpay popup script. Please check connection/adblockers.');
        setPaying(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TJeXxxFr0IK4lQ',
        amount: Math.round((order.totalAmount || 0) * 100),
        currency: 'INR',
        name: 'Platino Pharma',
        description: `Order ${order.orderNumber || order._id}`,
        handler: async function (response: Record<string, unknown>) {
          try {
            await apiPost(
              `/api/customer/v1/orders/${order.orderNumber || order._id}/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );
            toast.success('Payment successful! Order verified.');
            refetch();
          } catch (e: unknown) {
            toast.error('Payment verification failed on server');
          }
        },
        prefill: {
          name: order.customerName,
          contact: order.customerPhone || '',
        },
        theme: { color: '#0F5132' },
      };

      interface RazorpayInstance { on(event: string, handler: (response: Record<string, unknown>) => void): void; open(): void; }
      const Razorpay = (window as { Razorpay?: { new(options: unknown): RazorpayInstance } }).Razorpay;
      if (!Razorpay) throw new Error("Razorpay not found");
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response: Record<string, unknown>) {
        toast.error((response.error as { description?: string })?.description || 'Payment failed');
      });
      rzp.open();
    } catch (err: unknown) {
      toast.error(`Error opening Razorpay popup: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPaying(false);
    }
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    doc.text(`Invoice - Order ${order.orderNumber || order._id}`, 10, 10);
    doc.text(`Customer: ${order.customerName}`, 10, 20);
    doc.text(`Total Amount: ${formatINR(order.totalAmount || 0)}`, 10, 30);
    doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 10, 40);
    doc.text(`Address: ${typeof order.deliveryAddress === 'string' ? order.deliveryAddress : order.deliveryAddress?.line1 || ''}`, 10, 50);

    let y = 70;
    doc.text('Items:', 10, 60);
    order.items?.forEach((item: OrderItem) => {
      doc.text(
        `${item.medicineName || item.productId} x ${item.quantity} = ${formatINR(
          item.totalPrice || 0
        )}`,
        10,
        y
      );
      y += 10;
    });

    doc.save(`invoice_${order.orderNumber || order._id}.pdf`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/orders" className="hover:text-foreground">
          Orders
        </Link>
        <span>/</span>
        <span className="text-foreground">#{order.orderNumber || order._id}</span>
      </nav>

      {/* Title & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium sm:text-4xl">Track your order</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCancelled
              ? `Order Cancelled / Rejected`
              : isDelivered
                ? `Delivered by ${order.pharmacyName ?? 'pharmacy'}`
                : `Status: ${order.orderStatus?.replace(/_/g, ' ') ?? 'Processing'} · ${order.pharmacyName ?? ''}`}
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Link
            href={`/support/TKT-${Math.floor(10000 + Math.random() * 90000)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Headphones className="h-4 w-4 text-white" /> Need Help? Live Support
          </Link>

          {!isCancelled && !isDelivered && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="h-4 w-4" /> Cancel Order
            </button>
          )}

          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center gap-2 rounded-lg bg-surface-elevated border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted cursor-pointer"
          >
            <Download className="h-4 w-4" /> Invoice
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Main Status Timeline */}
          <div className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-soft">
            {isCancelled ? (
              <div className="py-10 text-center text-destructive font-medium">
                This order has been cancelled or rejected by the pharmacist.
                {order.pharmacistNotes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reason: {order.pharmacistNotes}
                  </p>
                )}
              </div>
            ) : (
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-px bg-border" />
                {timeline.map((t, i) => {
                  const active = i <= (order.orderStatus ? getActiveTimelineIndex(order.orderStatus) : 0);
                  return (
                    <motion.div
                      key={t.key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="relative pb-8 last:pb-0"
                    >
                      <div
                        className={cn(
                          'absolute -left-8 top-0 grid h-6 w-6 place-items-center rounded-full border-2 bg-background transition-colors',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border'
                        )}
                      >
                        {active && <Check className="h-3 w-3" strokeWidth={3} />}
                      </div>
                      <div
                        className={cn('text-sm font-medium', !active && 'text-muted-foreground')}
                      >
                        {t.label}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{t.hint}</div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECURE RIDER DETAILS & DELIVERY OTP PIN CARD (WHEN OUT FOR DELIVERY) */}
          {(isOutForDelivery || isArrivedAtCustomer) && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Rider Profile Card */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-900 text-white p-5 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-800 text-white font-bold text-base">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded-full mb-0.5">
                        <UserCheck className="h-3 w-3" /> Delivery Rider Assigned
                      </div>
                      <h3 className="text-base font-bold text-white">{riderInfo.name}</h3>
                      <p className="text-xs text-emerald-200">Vehicle: {riderInfo.vehicleNumber}</p>
                    </div>
                  </div>

                  <a
                    href={`tel:${riderInfo.phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-card text-emerald-950 font-bold px-4 py-2.5 text-xs shadow-soft hover:bg-emerald-100 transition-all cursor-pointer shrink-0"
                  >
                    <PhoneCall className="h-4 w-4 text-emerald-800" /> Call Rider
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-200 pt-1">
                  <span>Express Transit Status:</span>
                  <span className="font-bold text-white">
                    {isArrivedAtCustomer ? 'Arrived at Destination' : 'Out For Delivery (Arriving Soon)'}
                  </span>
                </div>
              </div>

              {/* Secure Delivery OTP Box / Policy Acknowledgment */}
              {isArrivedAtCustomer && !hasAcknowledgedPolicy && (
                <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 shadow-soft">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-900">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" /> DELIVERY VERIFICATION
                    </div>
                    <h3 className="text-lg font-bold text-emerald-950">Your rider has arrived</h3>
                    <p className="text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
                      For eligible products/orders, returns or exchanges may not be available after delivery. 
                      Please review the applicable return/cancellation policy before accepting the order. 
                      Your delivery OTP will be required to complete the handover.
                    </p>
                    <div className="flex flex-col w-full max-w-xs gap-3 pt-2">
                      <button 
                        onClick={() => setShowPolicyModal(true)}
                        className="text-emerald-700 text-sm font-medium hover:underline cursor-pointer"
                      >
                        View Return / Cancellation Policy
                      </button>
                      <button
                        onClick={handleAcknowledgePolicy}
                        disabled={acknowledgingPolicy}
                        className="rounded-full bg-emerald-700 text-white px-6 py-3 text-sm font-bold shadow-md hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {acknowledgingPolicy ? 'Generating...' : 'I Understand'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(isArrivedAtCustomer || isOutForDelivery) && hasAcknowledgedPolicy && (
                <div className="rounded-2xl border-2 border-dashed border-emerald-600 bg-emerald-50 p-6 text-center space-y-3 shadow-soft">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" /> Secure Delivery PIN / OTP
                  </div>

                  <div className="flex items-center justify-center gap-3 py-1">
                    <span className="text-4xl font-extrabold tracking-widest text-emerald-950 font-mono">
                      {deliveryPin}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="rounded-xl border border-emerald-300 bg-card p-2 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="Copy OTP"
                    >
                      {copiedOtp ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>

                  <p className="text-xs font-medium text-emerald-800 max-w-sm mx-auto leading-relaxed">
                    Share this 4-digit PIN with your delivery rider only upon receiving your verified medical package.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payment Gateway Block */}
          {isPaymentPending && (
            <div className="rounded-3xl border-2 border-primary bg-primary/[0.03] p-6 text-center shadow-sm">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-medium">Payment Required</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your order has been verified by the pharmacist. Please complete payment to finalize your order.
              </p>
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="text-3xl font-bold">
                  {formatINR(order.totalAmount || order.subtotal || 0)}
                </div>
                <button
                  onClick={handlePayNow}
                  disabled={paying}
                  className="mt-2 inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary font-medium text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {paying ? 'Opening Secure Gateway...' : 'Pay Now'}
                </button>
                <div className="mt-3 text-xs text-muted-foreground">
                  Secure processing via Razorpay
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Cards */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pharmacy
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">
                  {order.pharmacyName || 'Pending Assignment'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Delivering to
            </div>
            <div className="mt-2 text-sm font-medium text-foreground">
              {typeof order.deliveryAddress === 'string'
                ? order.deliveryAddress
                : order.deliveryAddress?.line1 || 'No Address Provided'}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isPaymentPending ? 'Final Verified Invoice' : 'Estimated Order Details'}
            </div>
            <div className="mt-3 space-y-3">
              {order.items?.map((i: NonNullable<typeof order.items>[number]) => (
                <div key={i.productId || i.medicineId} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="truncate font-medium text-foreground">
                      {i.medicineName || i.productId}
                    </div>
                    <div className="text-muted-foreground">Qty {i.quantity}</div>
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    {formatINR(i.totalPrice || (i.unitPrice || i.price || 0) * i.quantity)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3 text-xs">
              <div className="flex justify-between font-display text-lg font-semibold mt-2 text-foreground">
                <span>Total</span>
                <span>{formatINR(order.totalAmount || order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground mt-1">
                <span>Payment Status</span>
                <span
                  className={cn(
                    'font-medium',
                    order.paymentStatus === 'LOCKED_PRE_VERIFICATION'
                      ? 'text-amber-600'
                      : 'text-foreground'
                  )}
                >
                  {order.paymentStatus?.replace(/_/g, ' ') || 'LOCKED'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-xl">
            <h2 className="text-xl font-bold">Return & Cancellation Policy</h2>
            <div className="mt-4 text-sm text-muted-foreground space-y-3 max-h-96 overflow-y-auto">
              <p>1. All medicine deliveries are subject to strict hygiene and safety standards.</p>
              <p>2. Products once delivered and opened cannot be returned unless found defective or damaged upon immediate inspection.</p>
              <p>3. Refrigerated medicines are non-returnable under any circumstances.</p>
              <p>4. By providing the delivery OTP, you confirm that the order has been handed over to you in good condition.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
