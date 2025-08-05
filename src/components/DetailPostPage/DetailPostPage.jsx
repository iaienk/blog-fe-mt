// src/components/DetailPostPage/DetailPostPage.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../Modal/Modal';
import styles from './DetailPostPage.module.scss';
import { userSelector } from '../../reducers/user.slice';
import { selectAllPosts, selectDeletedIds, postDeleted } from '../../reducers/post.slice';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { PostModal } from '../PostModal/PostModal';
import { useSocketContext } from '../../context/SocketProvider';

const DetailPostPage = ({ post: _post, onClose, onDelete }) => {
  const dispatch   = useDispatch();
  const user       = useSelector(userSelector);
  const allPosts   = useSelector(selectAllPosts);
  const deletedIds = useSelector(selectDeletedIds);
  const { socket, ready } = useSocketContext();

  // Prendo la versione aggiornata dal store, altrimenti uso _post
  const post = allPosts.find(p => p.id === _post.id) || _post;
  const [isEditing, setIsEditing] = useState(false);

  const canEdit   = user?.id === post.authorId;
  const isDeleted = deletedIds.includes(post.id);

  const placeholder =
    'https://res.cloudinary.com/dkijvk8aq/image/upload/v1753866488/placeholder-image.png';
  const imageUrl = post.image || placeholder;

  const isModified   = post.publishDate !== _post.publishDate;
  const published    = new Date(post.publishDate);
  const formattedDate = published.toLocaleDateString('it-IT', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
  const formattedTime = published.toLocaleTimeString('it-IT', {
    hour:   '2-digit',
    minute: '2-digit',
  });
  const label = isModified ? 'Modificato:' : 'Pubblicato:';

  const closeTimer = useRef(null);

    useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleEditClose = () => setIsEditing(false);

  const handleDelete = () => {
    if (!ready || !socket) {
      return alert('Connessione non pronta. Riprova tra un attimo.');
    }
    if (!window.confirm('Eliminare definitivamente questo post?')) return;

    socket.emit('deletePost', { postId: post.id }, response => {
      if (response.success) {
        // dispatch diretto: aggiorna deletedIds in store
        dispatch(postDeleted(post.id));
        // se hai bisogno di far fare qualcos'altro al parent:
        onDelete?.(post.id);
        closeTimer.current = setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        alert(`Errore: ${response.error?.message || 'Impossibile cancellare il post'}`);
      }
    });
  };

  return (
    <>
      <Modal onClose={onClose} className={styles['detail-modal']}>
        <article className={styles.post}>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>{post.title}</h1>

              {isDeleted && (
                <span className={styles.deletedBadge}>
                  Post già eliminato
                </span>
              )}

              {canEdit && (
                <div className={styles.controls}>
                  <button
                    className={styles.editBtn}
                    onClick={() => setIsEditing(true)}
                    aria-label="Modifica post"
                  >
                    <FiEdit />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={handleDelete}
                    aria-label="Elimina post"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>

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
