// src/components/Comments/CommentList.jsx
import React from 'react';
import CommentItem from './CommentItem';
import styles from './CommentList.module.scss';

export default function CommentList({ comments }) {
  if (!comments.length) {
    return <p className={styles.empty}>Nessun commento</p>;
  }

  return (
    <ul className={styles.list}>
      {comments.map((comment, index) => {
        // Usa _id se presente, altrimenti id, altrimenti l'indice come fallback
        const key = comment._id ?? comment.id ?? index;
        return (
          <CommentItem
            key={key}
            comment={comment}
          />
        );
      })}
    </ul>
  );
}