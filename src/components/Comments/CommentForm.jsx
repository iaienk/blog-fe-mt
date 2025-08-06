// src/components/CommentForm.js
import React, { useState, useEffect } from 'react';
import { useDispatch }                from 'react-redux';
import { useSocketContext }           from '../../context/SocketProvider';
import { commentAdded }               from '../../reducers/comment.slice';
import styles from './CommentForm.module.scss';

export default function CommentForm({ postId }) {
  const dispatch = useDispatch();
  const { socket, ready } = useSocketContext();
  const [text, setText]   = useState('');

  useEffect(() => {
    if (!ready || !socket) return;
    socket.emit('JOIN_POST_ROOM', { postId });
    return () => socket.emit('LEAVE_POST_ROOM', { postId });
  }, [ready, socket, postId]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit(
      'createComment',
      { postId, text },
      response => {
        if (response.success) {
          // dispatch immediatamente il commento appena creato
          dispatch(commentAdded(response.data));
          setText('');
        } else {
          alert('Errore: ' + (response.error?.message || 'impossibile commentare'));
        }
      }
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Scrivi un commento..."
        required
      />
      <button className={styles.submitBtn} type="submit">Invia</button>
    </form>
  );
}
