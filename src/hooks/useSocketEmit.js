import { useContext, useCallback } from 'react';
import { SocketContext } from '../context/SocketProvider';

export function useSocketEmit() {
  const { socket, ready } = useContext(SocketContext);  // <-- ready, non socketReady

  const getTags = useCallback((payload) => {
    return new Promise((resolve, reject) => {
      if (!ready || !socket) {
        return reject(new Error('WebSocket non pronto'));
      }
      socket.emit('getTags', payload, (response) => {
        if (response.success) {
          resolve(response.data);   // { tags: […] }
        } else {
          reject(response.error || new Error('GET_TAGS fallito'));
        }
      });
    });
  }, [socket, ready]);

  return { getTags };
}