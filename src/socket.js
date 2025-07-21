import { io } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  if (socket) {
    socket.disconnect(); // disconnetti socket precedente, se esiste
  }

  socket = io('/', {
    path: '/socket.io',
    withCredentials: true,
    auth: {
      token: localStorage.getItem('token'),
    },
    // transports: ['websocket'], // opzionale
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

  return socket;
}

export function getSocket() {
  return socket;
}