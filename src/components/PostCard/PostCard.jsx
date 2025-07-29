import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post }) => {
  console.log("🔍 Post payload:", post);
  const { title, content, authorId, publishDate } = post;
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
  const placeholder = "https://res.cloudinary.com/dkijvk8aq/image/upload/v1753049173/samples/ecommerce/analog-classic.jpg";
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>Created by ID: {authorId}</span>
      </div>

    <img
      src={placeholder}
      alt={title}
      className={styles.image}
    />

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