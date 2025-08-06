// src/components/Comments/CommentItem.jsx
import React, { useState } from 'react';
import { useSelector }      from 'react-redux';
import { useSocketContext } from '../../context/SocketProvider';
import { userSelector }     from '../../reducers/user.slice';
import styles               from './CommentItem.module.scss';

export default function CommentItem({ comment }) {
  const { socket, ready } = useSocketContext();
  const user              = useSelector(userSelector);
  const me                = user?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText]           = useState(comment.text);

  const save = () => {
    socket.emit('updateComment', { commentId: comment._id, text });
    setIsEditing(false);
  };

  const remove = () => {
    socket.emit('deleteComment', { commentId: comment._id });
  };

  const dateTime = new Date(comment.created_at).toLocaleString('it-IT', {
    day:   '2-digit', month: '2-digit', year: 'numeric',
    hour:  '2-digit', minute: '2-digit'
  });

  return (
    <li className={styles.item}>
      <div className={styles.header}>
        <div className={styles.creator}>
          <span className={styles.authorLabel}>Created by:</span>
          <span className={styles.author}>{comment.authorId}</span>
        </div>
        <span className={styles.date}>{dateTime}</span>
      </div>

      {me === comment.authorId && ready ? (
        isEditing ? (
          <>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div className={styles.controls}>
              <button className={styles.editBtn} onClick={save}>
                Salva
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => setIsEditing(false)}
              >
                Annulla
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.text}>{comment.text}</p>
            <div className={styles.controls}>
              <button
                className={styles.editBtn}
                onClick={() => setIsEditing(true)}
              >
                Modifica
              </button>
              <button className={styles.deleteBtn} onClick={remove}>
                Elimina
              </button>
            </div>
          </>
        )
      ) : (
        <p className={styles.text}>{comment.text}</p>
      )}
    </li>
  );
}
