import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post }) => {
  const { title, content, image, authorId, publishDate } = post;
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

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>Created by ID: {authorId}</span>
      </div>

      {image && <img src={image} alt={title} className={styles.image} />}

      <h2 className={styles.title}>{title}</h2>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className={styles.footer}>
        Pubblicato: {formattedDate} alle {formattedTime}
      </div>
    </div>
  );
};

export default PostCard;