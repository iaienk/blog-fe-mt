import { useCallback } from 'react';
import { useSocketContext } from '../context/SocketProvider';

export function useSocketEmit() {
  const { socket, ready } = useSocketContext();

  const getTags = useCallback((payload) => {
    return new Promise((resolve, reject) => {
      if (!ready || !socket) {
        return reject(new Error('WebSocket non pronto'));
      }
      socket.emit('getTags', payload, (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(response.error || new Error('getTags fallito'));
        }
      });
    });
  }, [socket, ready]);

  return { getTags };
}