'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { SupportChatWidget } from '@/components/support/SupportChatWidget';
import { toast } from 'sonner';

export default function SupportTicketPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const ticketId = resolvedParams.ticketId;
  const pharmacyName = searchParams.get('pharmacy');
  const orderId = searchParams.get('orderId') || (pharmacyName ? `STORE-${pharmacyName.toUpperCase().replace(/\s+/g, '')}` : 'ORD-84632056');

  useEffect(() => {
    if (!orderId && !pharmacyName) {
      toast.info('Please select an order to get help');
      router.push('/orders');
    }
  }, [orderId, pharmacyName, router]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>/</span>
        <Link href="/orders" className="hover:text-gray-900">Orders</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">
          {pharmacyName ? `${pharmacyName} Support` : `Order Support (${orderId})`}
        </span>
      </nav>

      <SupportChatWidget
        ticketId={ticketId}
        pharmacyName={pharmacyName || undefined}
        orderId={orderId}
      />
    </div>
  );
}
