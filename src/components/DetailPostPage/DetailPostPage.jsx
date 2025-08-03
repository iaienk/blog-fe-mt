import React from 'react';
import Modal from '../Modal/Modal';
import styles from './DetailPostPage.module.scss';

const DetailPostPage = ({ post, onClose }) => {
  // URL di fallback
  const placeholder =
    'https://res.cloudinary.com/dkijvk8aq/image/upload/v1753866488/placeholder-image.png';
  const imageUrl = post.image || placeholder;

  const published = new Date(post.publishDate);
  const formattedDate = published.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = published.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal onClose={onClose} className={styles['detail-modal']}>
      <article className={styles.post}>
        <header>

          <h1 className={styles.title}>{post.title}</h1>

        {post.tags && post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map(tag => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}
          <div className={styles.meta}>
            <span>di ID {post.authorId}</span>

            <span>
              Pubblicato: {formattedDate} alle {formattedTime}
            </span>
            
          </div>
        </header>

        {/* Mostra sempre un'immagine */}
        <img src={imageUrl} alt={post.title} className={styles.image} />

        <section
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <section className={styles.comments}>
          <h2>Commenti</h2>
          <p>Nessun commento</p>
        </section>
      </article>
    </Modal>
  );
};

export default DetailPostPage;
