// src/components/Likes/LikesButton.jsx
import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSocketContext }    from '../../context/SocketProvider';
import { useSelector }         from 'react-redux';
import { userSelector }        from '../../reducers/user.slice';
import styles                  from './LikesButton.module.scss';

const LikeButton = ({ postId, initialLiked, initialCount }) => {
  const { socket, ready } = useSocketContext();
  const user              = useSelector(userSelector);
  const userId            = user?.id;

  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const extractLikers = payload =>
    Array.isArray(payload.liked_by)   ? payload.liked_by
  : Array.isArray(payload.userIds)    ? payload.userIds
  : Array.isArray(payload.likedBy)    ? payload.likedBy
  : [];

  useEffect(() => {
    if (!socket) return;
    const onBroadcast = updatedPost => {
      if (updatedPost.id !== postId) return;
      setCount(updatedPost.total_likes);
      const likers = extractLikers(updatedPost);
      setLiked(userId ? likers.includes(userId) : false);
    };
    socket.on('likeToggled', onBroadcast);
    return () => socket.off('likeToggled', onBroadcast);
  }, [socket, postId, userId]);

  const toggleLike = e => {
    e.stopPropagation();
    if (!userId) {
      return alert('Devi essere loggato per mettere like');
    }
    if (!ready) {
      return alert('Connessione non pronta. Riprova tra un attimo.');
    }
    socket.emit(
      'toggleLike',
      { postId },
      response => {
        if (!response.success) {
          return alert(`Errore: ${response.error?.message || 'azione fallita'}`);
        }
        const { total_likes } = response.data;
        const likers = extractLikers(response.data);
        setCount(total_likes);
        setLiked(userId ? likers.includes(userId) : false);
      }
    );
  };

  return (
    <button
      onClick={toggleLike}
      className={styles.button}
      disabled={!userId} // disabilitato se non loggato
      title={!userId ? 'Devi essere loggato per mettere like' : undefined}
    >
      {liked
        ? <FaHeart    className={styles.icon} />
        : <FaRegHeart className={styles.icon} />
      }
      <span className={styles.count}>{count}</span>
    </button>
  );
};

export default LikeButton;
