import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post }) => {
  const { title, content, image, author } = post;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <img src={author?.avatar} alt={author?.name} className={styles.avatar} />
        <span className={styles.name}>{author?.name}</span>
      </div>
      {image && <img src={image} alt={title} className={styles.image} />}
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default PostCard;