import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    // Connect to production URL if configured, otherwise fallback to local 5000
    const envUrl = import.meta.env.VITE_API_URL;
    const host = window.location.hostname || '127.0.0.1';
    const socketUrl = envUrl ? envUrl.replace(/\/api\/?$/, '') : `http://${host}:5000`;

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });
  }
  return socket;
};
