import React, { useState } from 'react';
import { useSelector }       from 'react-redux';
import Modal                 from '../Modal/Modal';
import styles                from './DetailPostPage.module.scss';
import { userSelector }      from '../../reducers/user.slice.js';
import { selectAllPosts }    from '../../reducers/post.slice';
import { FiEdit }            from 'react-icons/fi';
import { PostModal }         from '../PostModal/PostModal';

const DetailPostPage = ({ post: _post, onClose }) => {
  const user     = useSelector(userSelector);
  const allPosts = useSelector(selectAllPosts);
  // Prendiamo la versione più recente del post dallo store
  const post     = allPosts.find(p => p.id === _post.id) || _post;
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = user?.id === post.authorId;
  const placeholder =
    'https://res.cloudinary.com/dkijvk8aq/image/upload/v1753866488/placeholder-image.png';
  const imageUrl = post.image || placeholder;

  // Il campo publishDate viene aggiornato ad ogni edit => usiamolo per decidere label
  const isModified = post.publishDate !== _post.publishDate;
  const rawDate    = post.publishDate;
  const published  = new Date(rawDate);
  const formattedDate = published.toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const formattedTime = published.toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit',
  });
  const label = isModified ? 'Modificato:' : 'Pubblicato:';

  // Chiude solo il PostModal, mantenendo aperto il DetailPostPage
  const handleEditClose = () => setIsEditing(false);

  return (
    <>
      <Modal onClose={onClose} className={styles['detail-modal']}>
        <article className={styles.post}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>
            {canEdit && (
              <button
                className={styles.editBtn}
                onClick={() => setIsEditing(true)}
                aria-label="Modifica post"
              >
                <FiEdit />
              </button>
            )}
            {post.tags?.length > 0 && (
              <div className={styles.tags}>
                {post.tags.map(tag => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}
            <div className={styles.meta}>
              <span>di ID {post.authorId}</span>
              <span>
                {label} {formattedDate} alle {formattedTime}
              </span>
            </div>
          </header>

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

      {isEditing && (
        <PostModal
          mode="edit"
          initialData={post}
          onClose={handleEditClose}
        />
      )}
    </>
  );
};

export default DetailPostPage;