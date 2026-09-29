import { io, Socket } from 'socket.io-client';
import { getCookie } from './cookies';
import { ClientToServerEvents, ServerToClientEvents } from '@/types/socket';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketManager {
  private socket: TypedSocket | null = null;
  private url: string;

  constructor() {
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      socketUrl = socketUrl.replace('localhost', window.location.hostname);
    }

    let cleaned = socketUrl.replace(/\/api\/?$/, "");

    if (!cleaned || cleaned.startsWith('/')) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
      cleaned = `${protocol}//${hostname}:8000`;
    }

    this.url = cleaned;
  }

  public connect(tokenOverride?: string): TypedSocket {
    let token = tokenOverride;
    if (!token && typeof window !== 'undefined') {
      token = getCookie('patient_session') || undefined;
      if (!token) {
        try {
          const stored = localStorage.getItem('platino_patient_token');
          if (stored) {
            token = JSON.parse(stored)?.state?.accessToken || undefined;
          }
        } catch (e) { }
      }
    }

    if (this.socket) {
      if (token && (!this.socket.auth || (this.socket.auth as any).token !== token)) {
        this.socket.auth = { token };
      }
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    this.socket = io(this.url, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      auth: token ? { token } : {},
      autoConnect: true,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'transport close' || reason === 'transport error') {
        console.info('[Socket] Temporary disconnect (dev reload or network blip). Auto-reconnecting...');
      } else if (reason === 'io server disconnect') {
        console.warn('[Socket] Server force-disconnected. Reconnecting...');
        this.socket?.connect();
      } else {
        console.warn('[Socket] Disconnected:', reason);
      }
    });

    this.socket.io.on('reconnect', (attempt: number) => {
      console.log(`[Socket] Reconnected after ${attempt} attempt(s)`);
    });

    this.socket.io.on('reconnect_error', (error: Error) => {
      console.warn('[Socket] Reconnect attempt failed:', error.message);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection attempt issue:', error.message || error);
    });

    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): TypedSocket | null {
    return this.socket;
  }
}

// Export as a singleton
export const socketManager = new SocketManager();

