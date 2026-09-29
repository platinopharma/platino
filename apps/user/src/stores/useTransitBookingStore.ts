'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransitMode = 'AIRPORT' | 'TRAIN' | 'BUS';
export type RecipientType = 'SELF' | 'OTHER';

export interface RecipientDetails {
  name: string;
  phone: string;
  alternatePhone?: string;
  sendWhatsappNotification?: boolean;
}

export interface TransitDetails {
  hubName: string;
  hubCode?: string;
  terminalOrPlatform?: string;
  coachOrSeatOrBay?: string;
  pnrOrFlightNo?: string;
  departureTime?: string;
  coordinates?: [number, number]; // [lng, lat]
  handoffPointLabel?: string;
}

export interface TransitBookingState {
  isTransitOrder: boolean;
  transitMode: TransitMode;
  recipientType: RecipientType;
  recipientDetails: RecipientDetails;
  transitDetails: TransitDetails;

  setTransitBooking: (params: {
    mode: TransitMode;
    recipientType: RecipientType;
    recipientDetails: RecipientDetails;
    transitDetails: TransitDetails;
  }) => void;
  clearTransitBooking: () => void;
}

const defaultState = {
  isTransitOrder: false,
  transitMode: 'AIRPORT' as TransitMode,
  recipientType: 'SELF' as RecipientType,
  recipientDetails: {
    name: 'Awais Nadeem',
    phone: '+91 98765 43210',
    alternatePhone: '',
    sendWhatsappNotification: true,
  },
  transitDetails: {
    hubName: 'Rajiv Gandhi International Airport (HYD)',
    hubCode: 'HYD',
    terminalOrPlatform: 'Terminal 1 / Gate 4B',
    coachOrSeatOrBay: '',
    pnrOrFlightNo: '6E-204',
    coordinates: [78.4299, 17.2403] as [number, number],
    handoffPointLabel: 'Main Departure Gate 4B Handoff',
  },
};

export const useTransitBookingStore = create<TransitBookingState>()(
  persist(
    (set) => ({
      ...defaultState,

      setTransitBooking: (params) =>
        set({
          isTransitOrder: true,
          transitMode: params.mode,
          recipientType: params.recipientType,
          recipientDetails: params.recipientDetails,
          transitDetails: params.transitDetails,
        }),

      clearTransitBooking: () =>
        set({
          ...defaultState,
          isTransitOrder: false,
        }),
    }),
    {
      name: 'platino_transit_booking_store',
    }
  )
);
