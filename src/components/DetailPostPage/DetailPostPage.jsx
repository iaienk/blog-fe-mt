// src/components/DetailPostPage/DetailPostPage.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch }     from 'react-redux';
import Modal                            from '../Modal/Modal';
import styles                           from './DetailPostPage.module.scss';
import { userSelector }                 from '../../reducers/user.slice';
import {
  selectAllPosts,
  selectDeletedIds,
  postDeleted
}                                       from '../../reducers/post.slice';
import {
  commentsLoaded,
  commentAdded,
  commentUpdated,
  commentRemoved,
  makeSelectCommentsByPost,
  makeSelectCommentCountByPost
}                                       from '../../reducers/comment.slice';
import { FiEdit, FiTrash2 }             from 'react-icons/fi';
import { useSocketContext }             from '../../context/SocketProvider';
import LikeButton                       from '../Likes/LikesButton';
import CommentList                      from '../../components/Comments/CommentList';
import CommentForm                      from '../../components/Comments/CommentForm';
import { PostModal }                    from '../PostModal/PostModal';

export default function DetailPostPage({ post: _post, onClose, onDelete }) {
  const dispatch   = useDispatch();
  const user       = useSelector(userSelector);
  const userId     = user?.id;
  const allPosts   = useSelector(selectAllPosts);
  const deletedIds = useSelector(selectDeletedIds);
  const { socket, ready } = useSocketContext();

  const post = allPosts.find(p => p.id === _post.id) || _post;

  const {
    total_likes = 0,
    liked_by = []
  } = post;
  const initialLiked = userId ? liked_by.includes(userId) : false;

  const selectCommentsByPost     = useMemo(makeSelectCommentsByPost, []);
  const selectCommentCountByPost = useMemo(makeSelectCommentCountByPost, []);
  const comments = useSelector(s => selectCommentsByPost(s, post.id));
  const count    = useSelector(s => selectCommentCountByPost(s, post.id));

  useEffect(() => {
    if (!ready) return;
    fetch(`${import.meta.env.VITE_API_URL}/posts/${post.id}/comments`)
      .then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(data => dispatch(commentsLoaded({ postId: post.id, comments: data.comments })))
      .catch(err => console.error('Errore caricamento commenti', err));
  }, [post.id, ready, dispatch]);

  useEffect(() => {
    if (!ready || !socket) return;
    socket.emit('joinPostRoom', { postId: post.id });
    socket.on('commentCreated',   c => dispatch(commentAdded(c)));
    socket.on('commentShared',    c => dispatch(commentAdded(c)));
    socket.on('commentUpdated',   c => dispatch(commentUpdated(c)));
    socket.on('commentDeleted',   ({ comment }) =>
      dispatch(commentRemoved({ postId: post.id, commentId: comment._id }))
    );
    return () => {
      socket.emit('leavePostRoom', { postId: post.id });
      socket.off('commentCreated');
      socket.off('commentShared');
      socket.off('commentUpdated');
      socket.off('commentDeleted');
    };
  }, [ready, socket, post.id, dispatch]);

  const [isEditing, setIsEditing] = useState(false);
  const canEdit   = userId === post.authorId;
  const isDeleted = deletedIds.includes(post.id);

  const placeholder   =
    'https://res.cloudinary.com/dkijvk8aq/image/upload/v1754562873/ImagesComingSoon.png';
  const imageUrl      = post.image || placeholder;
  const isModified    = post.publishDate !== _post.publishDate;
  const published     = new Date(post.publishDate);
  const formattedDate = published.toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const formattedTime = published.toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit'
  });
  const label         = isModified ? 'Modificato:' : 'Pubblicato:';

  const closeTimer = useRef(null);
  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const handleEditClose = () => setIsEditing(false);

  const handleDelete = () => {
    if (!ready || !socket) {
      return alert('Connessione non pronta. Riprova tra un attimo.');
    }
    if (!window.confirm('Eliminare definitivamente questo post?')) return;
    socket.emit('deletePost', { postId: post.id }, response => {
      if (response.success) {
        dispatch(postDeleted(post.id));
        onDelete?.(post.id);
        closeTimer.current = setTimeout(onClose, 2000);
      } else {
        alert(`Errore: ${response.error?.message || 'Impossibile cancellare il post'}`);
      }
    });
  };

  return (
    <>
      <Modal onClose={onClose} className={styles['detail-modal']}>
        <article className={styles.post}>
          {/* HEADER */}
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <h1 className={styles.title}>{post.title}</h1>
              {isDeleted && <span className={styles.deletedBadge}>Post già eliminato</span>}
              {canEdit && !isDeleted && (
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

            {/* TAGS */}
            {post.tags?.length > 0 && (
              <div className={styles.tags}>
                {post.tags.map(tag => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}

            {/* META & LIKES */}
            <div className={styles.meta}>
              <span>di ID {post.authorId}</span>
              <span>{label} {formattedDate} alle {formattedTime}</span>
              <LikeButton
                postId={post.id}
                initialLiked={initialLiked}
                initialCount={total_likes}
              />
            </div>
          </header>

          {/* IMAGE & CONTENT */}
          <img src={imageUrl} alt={post.title} className={styles.image} />
          <section
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* COMMENTS */}
          <section className={styles.comments}>
            <h2>Commenti ({count})</h2>
            {ready ? (
              <>
                <CommentList comments={comments} />
                {!isDeleted && <CommentForm postId={post.id} />}
              </>
            ) : (
              <p>Effettua il login per visualizzare e scrivere commenti.</p>
            )}
          </section>
        </article>
      </Modal>

      {isEditing && (
        <PostModal mode="edit" initialData={post} onClose={handleEditClose} />
      )}
    </>
  );
}
