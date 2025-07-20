import { io } from 'socket.io-client';

export const socket = io('/', {
  path: '/socket.io',
  withCredentials: true,
//   transports: ['websocket'],   // forza WebSocket, evita polling
});

socket.on('connect', () => {
  console.log('[SOCKET] connesso con id:', socket.id);
});

socket.onAny((event, ...args) => {
  console.log(`[SOCKET onAny] evento='${event}'`, args);
});

socket.on('connect_error', (err) => {
  console.error('[SOCKET] connect_error:', err);
});

socket.on('error', (err) => {
  console.error('[SOCKET] error:', err);
});