import { io } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  if (socket) {
    socket.disconnect(); // disconnetti socket precedente, se esiste
  }

  socket = io('/multiuserblog', {
    path: '/socket.io',
    withCredentials: true,
    auth: {
      token: (() => {
        try {
          return JSON.parse(localStorage.getItem('user'))?.accessToken || null;
        } catch {
          return null;
        }
      })(),
    }
    
  });
  console.log('[SOCKET] Connesso al namespace:', socket.nsp);

  socket.on('connect', () => {
    console.log('[SOCKET] connesso con id:', socket.id);
  });

  socket.on('postCreated', post => {
    console.log('Nuovo post creato:', post);
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
if (typeof window !== 'undefined') {
  window.getSocket = getSocket;
}
