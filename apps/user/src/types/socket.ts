export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'packed'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected'
  | 'cancelled'
  | 'refund_requested';

export interface OrderStatusUpdatePayload {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  updatedAt: string;
  deliveryFee: number;
}

export interface SupportMessage {
  ticketId: string;
  messageId: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface ServerToClientEvents {
  order_status_updated: (payload: OrderStatusUpdatePayload) => void;
  support_message_received: (payload: SupportMessage) => void;
  socket_error: (error: { message: string; code: string }) => void;
  'transit-updated'?: (payload: any) => void;
  'connect_error'?: (error: Error) => void;
  'disconnect'?: (reason: string) => void;
  'family:refill_alert'?: (payload: any) => void;
  'family:member_updated'?: (payload: any) => void;
  'medication:reminder'?: (payload: any) => void;
  'support:receive_message'?: (payload: any) => void;
  'support:typing_start'?: (payload: any) => void;
  'support:typing_stop'?: (payload: any) => void;
  'support:agent_assigned'?: (payload: any) => void;
}

export interface ClientToServerEvents {
  join_order_room: (data: { orderId: string }) => void;
  leave_order_room: (data: { orderId: string }) => void;
  join_store_room: (data: { pharmacyId: string }) => void;
  leave_store_room: (data: { pharmacyId: string }) => void;
  join_support_room: (data: { ticketId: string }) => void;
  leave_support_room: (data: { ticketId: string }) => void;
  'join-support-room'?: (data: any) => void;
  'leave-support-room'?: (data: any) => void;
  merchant_update_status: (data: { orderId: string; status: OrderStatus }) => void;
  'driver-location-ping'?: (data: any) => void;
  'support:send_message'?: (data: any) => void;
  'support:typing_start'?: (data: any) => void;
  'support:typing_stop'?: (data: any) => void;
}