import { useState, useEffect } from 'react';
import { useSocketContext } from '../context/SocketProvider';
import { getTags } from '../utils/tags';

export function useTags({ name = '', cursor = null, direction = 'next', limit = 50 } = {}) {
  const { socket, ready } = useSocketContext();
  const [tags, setTags]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!socket || !ready) return;
    setLoading(true);
    getTags(socket, { name, cursor, direction, limit })
      .then(data => {
        setTags(data);
        setError(null);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [socket, ready, name, cursor, direction, limit]);

  return { tags, loading, error };
}