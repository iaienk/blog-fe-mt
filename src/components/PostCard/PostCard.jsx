// src/components/PostCard/PostCard.jsx
import React, { useMemo, useEffect }    from 'react';
import { useSelector, useDispatch }     from 'react-redux';
import { userSelector }                 from '../../reducers/user.slice';
import { selectModifiedIds,
         selectDeletedIds }             from '../../reducers/post.slice';
import {
  makeSelectCommentsByPost,
  makeSelectCommentCountByPost,
  commentsLoaded
}                                       from '../../reducers/comment.slice';
import { FiTrash2, FiEdit }             from 'react-icons/fi';
import { useSocketContext }             from '../../context/SocketProvider';
import commentStyles                    from '../Comments/CommentItem.module.scss';
import styles                           from './PostCard.module.scss';

const PostCard = ({ post, onEdit, onViewDetail, onDelete }) => {
  const dispatch     = useDispatch();
  const { id, title, content, authorId, publishDate, image, tags = [] } = post;
  const userId       = useSelector(userSelector)?.id;
  const modifiedIds  = useSelector(selectModifiedIds);
  const deletedIds   = useSelector(selectDeletedIds);
  const { socket, ready } = useSocketContext();

  // memoized selectors per commenti
  const selectComments     = useMemo(makeSelectCommentsByPost, []);
  const selectCommentCount = useMemo(makeSelectCommentCountByPost, []);
  const comments           = useSelector(state => selectComments(state, id));
  const commentCount       = useSelector(state => selectCommentCount(state, id));

  // Carica i commenti per mostrare count e preview
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/posts/${id}/comments`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        dispatch(commentsLoaded({ postId: id, comments: data.comments }));
      })
      .catch(err => console.error('Errore caricamento commenti PostCard', err));
  }, [id, dispatch]);

  const isDeleted  = deletedIds.includes(id);
  const isModified = modifiedIds.includes(id);
  const label      = isModified ? 'Modificato:' : 'Pubblicato:';

  const dateObj       = new Date(publishDate);
  const formattedDate = dateObj.toLocaleDateString('it-IT', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('it-IT', {
    hour:   '2-digit',
    minute: '2-digit'
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
        onDelete?.(id);
      } else {
        alert(`Errore: ${response.error?.message || 'Impossibile cancellare il post'}`);
      }
    });
  };

  // ultimo commento
  const lastComment = comments.length > 0
    ? comments[comments.length - 1]
    : null;

  // formattazione data/ora commento
  const commentDate = lastComment
    ? new Date(lastComment.created_at).toLocaleString('it-IT', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
        hour:  '2-digit',
        minute:'2-digit'
      })
    : '';

  return (
    <div
      className={styles.card}
      onClick={() => onViewDetail?.(post)}
      style={{ cursor: onViewDetail ? 'pointer' : undefined }}
    >
      {isDeleted && (
        <div className={styles.deletedBadge}>
          Post già eliminato
        </div>
      )}

      {/* HEADER */}
      <div className={styles.header}>
        <span className={styles.name}>Autore ID: {authorId}</span>
        {userId === authorId && !isDeleted && (
          <div className={styles.actions}>
            <button
              className={styles.editButton}
              onClick={e => { e.stopPropagation(); onEdit?.(post); }}
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
          </div>
        )}
      </div>

      {/* TAGS */}
      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map(tag => (
            <span key={tag} className={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}

      <img src={imageUrl} alt={title} className={styles.image} />

      <h2 className={styles.title}>{title}</h2>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className={styles.footer}>
        {label} {formattedDate} alle {formattedTime}
      </div>

      <div className={styles.commentsMeta}>
        Commenti: {commentCount}
      </div>

      {userId && lastComment && (
        <div className={styles.preview}>
          <div className={commentStyles.item}>
            <div className={commentStyles.header}>
              <div className={commentStyles.creator}>
                <span className={commentStyles.authorLabel}>Created by:</span>
                <span className={commentStyles.author}>
                  {lastComment.authorUsername} {lastComment.authorId}
                </span>
              </div>
              <span className={commentStyles.date}>{commentDate}</span>
            </div>
            <p className={commentStyles.text}>{lastComment.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
