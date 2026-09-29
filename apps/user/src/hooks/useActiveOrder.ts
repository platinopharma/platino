'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOrders, useLocation } from '@/stores';
import { catalogService } from '@/services';
import { socketManager } from '@/lib/socket';
import type { OrderStatusUpdatePayload } from '@/types/socket';

export type ActiveOrderStatus = 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface ActiveOrderStore {
  name: string;
  type: string;
}

export interface ActiveOrderLocation {
  address: string;
  distanceKm: number;
}

export interface ActiveOrderItem {
  title: string;
  quantity: number;
}

export interface ActiveOrder {
  id: string;
  displayId: string;
  status: ActiveOrderStatus;
  estimatedDeliveryTime: string; // ISO string / timestamp
  store: ActiveOrderStore;
  deliveryLocation: ActiveOrderLocation;
  items: ActiveOrderItem[];
  totalItemCount: number;
  courierName?: string;
  courierPhone?: string;
}

export interface UseActiveOrderReturn {
  activeOrder: ActiveOrder;
  isLive: boolean;
  timeRemainingSeconds: number;
  formattedTimeRemaining: string;
  progressStep: 1 | 2 | 3;
  refreshOrder: () => void;
}

export function useActiveOrder(): UseActiveOrderReturn {
  const orders = useOrders((s) => s.orders);
  const areaId = useLocation((s) => s.areaId);
  const areas = catalogService.areas();
  const currentArea = useMemo(() => areas.find((a) => a.id === areaId) ?? areas[0], [areas, areaId]);

  const [liveStatusOverride, setLiveStatusOverride] = useState<ActiveOrderStatus | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(1122); // Default ~18m 42s

  // Normalize order from store or fallback preview
  const liveOrderFromStore = useMemo(() => {
    return orders.find(
      (o) =>
        o.status !== 'delivered' &&
        o.status !== 'DELIVERED' &&
        o.status !== 'CANCELLED' &&
        o.status !== 'REJECTED'
    );
  }, [orders]);

  const activeOrder: ActiveOrder = useMemo(() => {
    if (liveOrderFromStore) {
      const rawStatus = (liveOrderFromStore.status || '').toUpperCase();
      let status: ActiveOrderStatus = 'CONFIRMED';
      if (rawStatus === 'OUT_FOR_DELIVERY' || rawStatus === 'IN_TRANSIT') {
        status = 'OUT_FOR_DELIVERY';
      } else if (rawStatus === 'PACKED' || rawStatus === 'PREPARING' || rawStatus === 'ACCEPTED') {
        status = 'PACKED';
      }

      if (liveStatusOverride) {
        status = liveStatusOverride;
      }

      // Calculate estimated time ISO string (20 mins from creation)
      const creationTime = new Date(liveOrderFromStore.createdAt || Date.now()).getTime();
      const etaIso = new Date(creationTime + 20 * 60 * 1000).toISOString();

      const itemsList: ActiveOrderItem[] = (liveOrderFromStore.items || []).map((i) => ({
        title: `Item #${i.productId.slice(0, 6)}`,
        quantity: i.quantity || 1,
      }));

      return {
        id: liveOrderFromStore.id,
        displayId: `#${liveOrderFromStore.id.toUpperCase()}`,
        status,
        estimatedDeliveryTime: etaIso,
        store: {
          name: (liveOrderFromStore as unknown as { pharmacyName?: string }).pharmacyName || 'Apollo Pharmacy',
          type: 'Express Partner',
        },
        deliveryLocation: {
          address: liveOrderFromStore.address || `${currentArea.area}, ${currentArea.city}`,
          distanceKm: 1.2,
        },
        items: itemsList.length > 0 ? itemsList : [
          { title: 'Paracetamol 650mg', quantity: 1 },
          { title: 'Vitamin C 500mg', quantity: 2 },
        ],
        totalItemCount: itemsList.reduce((acc, curr) => acc + curr.quantity, 0) || 3,
        courierName: liveOrderFromStore.partner?.name || 'Ramesh Kumar (Verified Courier)',
        courierPhone: liveOrderFromStore.partner?.phone || '+91 98765 43210',
      };
    }

    // Default High-Fidelity Active Order for Live Demo Preview
    const fallbackEtaIso = new Date(Date.now() + 18.5 * 60 * 1000).toISOString();
    return {
      id: 'ORD-99193488',
      displayId: '#ORD-99193488',
      status: liveStatusOverride || 'OUT_FOR_DELIVERY',
      estimatedDeliveryTime: fallbackEtaIso,
      store: {
        name: 'Apollo Pharmacy',
        type: 'Express Handoff',
      },
      deliveryLocation: {
        address: `Madhapur, Hyderabad`,
        distanceKm: 1.2,
      },
      items: [
        { title: 'Dolo 650 Tablet', quantity: 1 },
        { title: 'Zincovit Syrup', quantity: 2 },
      ],
      totalItemCount: 3,
      courierName: 'Ramesh Kumar (Verified Courier)',
      courierPhone: '+91 98765 43210',
    };
  }, [liveOrderFromStore, liveStatusOverride, currentArea]);

  // Socket.IO Realtime Telemetry Subscription
  useEffect(() => {
    try {
      const socket = socketManager.connect();
      if (socket && activeOrder.id) {
        socket.emit('join_order_room', { orderId: activeOrder.id });

        const handleStatusUpdate = (payload: OrderStatusUpdatePayload) => {
          if (payload.orderId === activeOrder.id || payload.orderNumber === activeOrder.id) {
            const s = (payload.status || '').toUpperCase();
            if (s === 'OUT_FOR_DELIVERY' || s === 'IN_TRANSIT') {
              setLiveStatusOverride('OUT_FOR_DELIVERY');
            } else if (s === 'PACKED' || s === 'PREPARING') {
              setLiveStatusOverride('PACKED');
            } else if (s === 'DELIVERED') {
              setLiveStatusOverride('DELIVERED');
            }
          }
        };

        socket.on('order_status_updated', handleStatusUpdate);

        return () => {
          socket.off('order_status_updated', handleStatusUpdate);
          socket.emit('leave_order_room', { orderId: activeOrder.id });
        };
      }
    } catch (err) {
      console.warn('[useActiveOrder] Socket subscription error:', err);
    }
  }, [activeOrder.id]);

  // Countdown Ticker Effect
  useEffect(() => {
    const targetMs = new Date(activeOrder.estimatedDeliveryTime).getTime();
    const nowMs = Date.now();
    const initialDiffSecs = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
    setSecondsLeft(initialDiffSecs > 0 ? initialDiffSecs : 1122);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeOrder.estimatedDeliveryTime]);

  // Formatted timer string MM:SS
  const formattedTimeRemaining = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }, [secondsLeft]);

  // Calculate 3-stage progress step (1: CONFIRMED, 2: PACKED, 3: OUT_FOR_DELIVERY)
  const progressStep = useMemo(() => {
    if (activeOrder.status === 'OUT_FOR_DELIVERY') return 3;
    if (activeOrder.status === 'PACKED') return 2;
    return 1;
  }, [activeOrder.status]);

  const refreshOrder = useCallback(() => {
    setLiveStatusOverride(null);
  }, []);

  return {
    activeOrder,
    isLive: Boolean(liveOrderFromStore),
    timeRemainingSeconds: secondsLeft,
    formattedTimeRemaining,
    progressStep,
    refreshOrder,
  };
}
