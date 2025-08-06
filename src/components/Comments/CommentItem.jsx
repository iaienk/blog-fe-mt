// src/components/Comments/CommentItem.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocketContext }           from '../../context/SocketProvider';
import {
  commentsLoaded,
  commentUpdated,
  commentRemoved
}                                      from '../../reducers/comment.slice';
import { userSelector }               from '../../reducers/user.slice';
import styles                         from './CommentItem.module.scss';
// Import PostModal styles and icons
import modalStyles                    from '../PostModal/PostModal.module.scss';
import { FiX, FiSave, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function CommentItem({ comment }) {
  const dispatch        = useDispatch();
  const { socket, ready }  = useSocketContext();
  const user             = useSelector(userSelector);
  const me               = user?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText]           = useState(comment.text);

  const reloadComments = () => {
    fetch(`${import.meta.env.VITE_API_URL}/posts/${comment.postId}/comments`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data =>
        dispatch(commentsLoaded({ postId: comment.postId, comments: data.comments }))
      )
      .catch(err => console.error('Errore reload comments', err));
  };

  const save = () => {
    socket.emit(
      'updateComment',
      { commentId: comment.id, text },
      response => {
        if (response.success) {
          dispatch(commentUpdated(response.data));
          reloadComments();
        } else {
          alert('Errore aggiornamento: ' + (response.error?.message || '…'));
        }
      }
    );
    setIsEditing(false);
  };

  const remove = () => {
    socket.emit(
      'deleteComment',
      { commentId: comment.id },
      response => {
        if (response.deleted) {
          dispatch(commentRemoved({ postId: comment.postId, commentId: comment.id }));
          reloadComments();
        } else {
          alert('Errore cancellazione: ' + (response.error?.message || '…'));
        }
      }
    );
  };

  return (
    <li className={styles.item}>
      <div className={styles.header}>
        <div className={styles.creator}>
          <span className={styles.authorLabel}>Created by:</span>
          <span className={styles.author}>
            {comment.authorUsername} {comment.authorId}
          </span>
        </div>
        <span className={styles.date}>
          {new Date(comment.created_at).toLocaleString('it-IT', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour:'2-digit', minute:'2-digit'
          })}
        </span>
      </div>

      {isEditing ? (
        <div className={styles.editArea}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className={styles.textarea}
          />
          <div className={modalStyles['post-modal__actions']}>
            <button
              className={`${modalStyles.btn} ${modalStyles['btn--secondary']}`}
              onClick={() => setIsEditing(false)}
            >
              <FiX className={modalStyles.icon}/> Annulla
            </button>
            <button
              className={`${modalStyles.btn} ${modalStyles['btn--primary']}`}
              onClick={save}
             >
              <FiSave className={modalStyles.icon}/> Aggiorna
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className={styles.text}>{comment.text}</p>
          {me === comment.authorId && ready && (
            <div className={styles.controls}>
              <button
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
                aria-label="Modifica post"
            >
              <FiEdit />
              </button>
              <button
                className={styles.deleteButton}
                onClick={remove}
                aria-label="Elimina post"
            >
              <FiTrash2 />
              </button>
            </div>
          )}
        </>
      )}
    </li>
);
}
