import React from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '../../reducers/user.slice';
import styles from './PostCard.module.scss';

const PostCard = ({ post, onEdit, onViewDetail }) => {
  const { title, content, authorId, publishDate, image } = post;
  const userId = useSelector(userSelector);

  // Format date/time in italiano
  const dateObj = new Date(publishDate);
  const formattedDate = dateObj.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Fallback placeholder se non c'è image
  const placeholder =
    'https://res.cloudinary.com/dkijvk8aq/image/upload/v1753866488/placeholder-image.png';
  const imageUrl = image || placeholder;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>Created by ID: {authorId}</span>
      </div>

      <img src={imageUrl} alt={title} className={styles.image} />

      <h2 className={styles.title}>{title}</h2>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className={styles.footer}>
        Pubblicato: {formattedDate} alle {formattedTime}
      </div>

      {userId === authorId && (
        <button
          className={styles.editButton}
          onClick={() => onEdit(post)}
        >
          ✏️ Modifica
        </button>
      )}
           <button
        className={styles.viewButton}
        onClick={() => onViewDetail(post)}
      >
        🔍 Visualizza
      </button>
    </div>
  );
};

export default PostCard;