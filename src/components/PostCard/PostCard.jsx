import React from 'react';
import { useSelector }       from 'react-redux';
import { userSelector }      from '../../reducers/user.slice';
import { selectModifiedIds } from '../../reducers/post.slice';
import styles                from './PostCard.module.scss';

const PostCard = ({ post, onEdit, onViewDetail }) => {
  const { id, title, content, authorId, publishDate, image } = post;
  const userId      = useSelector(userSelector)?.id;
  const modifiedIds = useSelector(selectModifiedIds);

  // Determina se mostrare "Modificato:" o "Pubblicato:"
  const isModified = modifiedIds.includes(id);
  const label      = isModified ? 'Modificato:' : 'Pubblicato:';

  const dateObj       = new Date(publishDate);
  const formattedDate = dateObj.toLocaleDateString('it-IT', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('it-IT', {
    hour:   '2-digit',
    minute: '2-digit',
  });

  const placeholder = 'https://res.cloudinary.com/dkijvk8aq/image/upload/v1753866488/placeholder-image.png';
  const imageUrl    = image || placeholder;

  return (
    <div
      className={styles.card}
      onClick={() => onViewDetail?.(post)}
      style={{ cursor: onViewDetail ? 'pointer' : undefined }}
    >
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
        {userId === authorId && (
          <button
            className={styles.editButton}
            onClick={e => {
              e.stopPropagation();  // impedisce di aprire il dettaglio
              onEdit?.(post);
            }}
            aria-label="Modifica post"
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;