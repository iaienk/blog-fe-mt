// src/components/PostCard/PostCard.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { userSelector }      from '../../reducers/user.slice';
import { selectModifiedIds, selectDeletedIds } from '../../reducers/post.slice';
import { FiTrash2, FiEdit }  from 'react-icons/fi';
import { useSocketContext }  from '../../context/SocketProvider';
import styles from './PostCard.module.scss';

const PostCard = ({ post, onEdit, onViewDetail, onDelete }) => {
  const { id, title, content, authorId, publishDate, image } = post;
  const userId       = useSelector(userSelector)?.id;
  const modifiedIds  = useSelector(selectModifiedIds);
  const deletedIds   = useSelector(selectDeletedIds);
  const { socket, ready } = useSocketContext();

  // Nuovo: flag se è stato eliminato in questa sessione
  const isDeleted   = deletedIds.includes(id);
  const isModified  = modifiedIds.includes(id);
  const label       = isModified ? 'Modificato:' : 'Pubblicato:';

  const dateObj       = new Date(publishDate);
  const formattedDate = dateObj.toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit'
  });

  const placeholder = 'https://res.cloudinary.com/dkijvk8aq/image/upload/v1753866488/placeholder-image.png';
  const imageUrl    = image || placeholder;

  const handleDelete = e => {
    e.stopPropagation();
    if (!ready || !socket) {
      return alert('Connessione non pronta. Riprova tra un attimo.');
    }
    if (!window.confirm('Sei sicuro di voler eliminare questo post?')) return;

    socket.emit('deletePost', { postId: id }, response => {
      if (response.success) {
        onDelete?.(id);  // questo dispatcherà postDeleted(id)
      } else {
        alert(`Errore: ${response.error?.message || 'Impossibile cancellare il post'}`);
      }
    });
  };

  return (
    <div
      className={styles.card}
      onClick={() => onViewDetail?.(post)}
      style={{ cursor: onViewDetail ? 'pointer' : undefined }}
    >
      {/* badge in alto centro */}
      {isDeleted && (
        <div className={styles.deletedBadge}>
          Post già eliminato
        </div>
      )}

      <div className={styles.header}>
        <span className={styles.name}>Autore ID: {authorId}</span>
      </div>

      <img src={imageUrl} alt={title} className={styles.image} />

      <h2 className={styles.title}>{title}</h2>

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className={styles.footer}>
        {label} {formattedDate} alle {formattedTime}
      </div>

      <div className={styles.actions}>
        {/* Non mostro edit/delete se già cancellato */}
        {userId === authorId && !isDeleted && (
          <>
            <button
              className={styles.editButton}
              onClick={e => {
                e.stopPropagation();
                onEdit?.(post);
              }}
              aria-label="Modifica post"
            >
              <FiEdit />
            </button>
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
              aria-label="Elimina post"
            >
              <FiTrash2 />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PostCard;
