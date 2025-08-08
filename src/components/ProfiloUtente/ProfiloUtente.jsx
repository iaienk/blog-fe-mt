// src/pages/ProfiloUtente/ProfiloUtente.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate }               from 'react-router-dom';
import { useSelector, useDispatch }  from 'react-redux';
import { userSelector, setUser, clearUser } from '../../reducers/user.slice';
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus,
  postDeleted
} from '../../reducers/post.slice';
import { useSocketContext }          from '../../context/SocketProvider';
import PostCard                      from '../../components/PostCard/PostCard';
import DetailPostPage                from '../../components/DetailPostPage/DetailPostPage';
import { PostModal }                 from '../../components/PostModal/PostModal';
import styles                        from './ProfiloUtente.module.scss';
import { uploadImageToCloudinary }   from '../../utils/uploadImage';

const PLACEHOLDER =
  'https://res.cloudinary.com/dkijvk8aq/image/upload/v1753049295/profilePlaceholder.webp';

export default function ProfiloUtente() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const user        = useSelector(userSelector);
  const allPosts    = useSelector(selectAllPosts);
  const postsStatus = useSelector(selectPostsStatus);
  const { socket, ready } = useSocketContext();

  const [detailPost,  setDetailPost]  = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    if (postsStatus === 'idle') {
      dispatch(fetchPosts({ limit: 100 }));
    }
  }, [postsStatus, dispatch]);

  const sortedUserPosts = useMemo(() => {
    if (!user) return [];
    return allPosts
      .filter(p => p.authorId === user.id)
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
  }, [allPosts, user]);

  const [username, setUsername]             = useState(user?.username || '');
  const [avatar, setAvatar]                 = useState(user?.avatar || PLACEHOLDER);
  const [nuovoAvatarUrl, setNuovoAvatarUrl] = useState(null);
  const [usernameDisponibile, setUsernameDisponibile] = useState(true);
  const [feedback, setFeedback]             = useState('');
  const [isEditing, setIsEditing]           = useState(false);
  const hasChanges =
    username !== user?.username ||
    !!nuovoAvatarUrl;

  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setAvatar(user.avatar || PLACEHOLDER);
    setNuovoAvatarUrl(null);
    setUsernameDisponibile(true);
    setFeedback('');
  }, [user]);

  useEffect(() => {
    if (feedback === 'Profilo aggiornato con successo!') {
      const t = setTimeout(() => setFeedback(''), 2000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  useEffect(() => {
    if (!ready || !socket) return;
    if (!isEditing || username === user.username) {
      setUsernameDisponibile(true);
      return;
    }
    const t = setTimeout(() => {
      socket.emit('checkUsername', username, isAvailable => {
        setUsernameDisponibile(!!isAvailable);
      });
    }, 500);
    return () => clearTimeout(t);
  }, [socket, ready, isEditing, username, user?.username]);

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImageToCloudinary(file);
      setNuovoAvatarUrl(url);
      setAvatar(url);
    } catch (err) {
      console.error('[ProfiloUtente] uploadError:', err);
      setFeedback('Errore durante l’upload dell’avatar');
    }
  };

  const handleSalva = async () => {
    if (!usernameDisponibile || !hasChanges) return;
    try {
      const body = { username };
      if (nuovoAvatarUrl) body.avatar = nuovoAvatarUrl;
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/user/profile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error();
      const updated = await res.json();
      dispatch(setUser({ ...user, ...updated }));
      setFeedback('Profilo aggiornato con successo!');
      setIsEditing(false);
    } catch {
      setFeedback('Errore durante il salvataggio');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleAnnulla = () => {
    setUsername(user.username);
    setAvatar(user.avatar || PLACEHOLDER);
    setNuovoAvatarUrl(null);
    setFeedback('');
    setIsEditing(false);
    setUsernameDisponibile(true);
  };

  // Post handlers
  const handleViewDetail = post => setDetailPost(post);
  const handleCloseDetail = () => setDetailPost(null);

  const handleEdit = post => setEditingPost(post);
  const handleCloseEdit = () => setEditingPost(null);

  const handleDelete = postId => {
    dispatch(postDeleted(postId));

    if (detailPost?.id === postId) {
      setDetailPost(null);
    }
  };

  return (
    <div className={styles.containerProfilo}>
      {!user ? (
        <>
          <p>Devi effettuare il login per accedere al profilo.</p>
          <button
            onClick={() => navigate('/login')}
            className={styles.loginButton}
          >
            Vai al Login
          </button>
        </>
      ) : (
        <>
          <div className={styles.avatar}>
            <img src={avatar} alt="Avatar utente" />
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            )}
          </div>

          <div className={styles.infoUtente}>
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" value={user.email} readOnly />
          </div>

          <div className={styles.infoUtente}>
            <label>Username:</label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={username}
                  onChange={e => {
                    setUsername(e.target.value);
                    setFeedback('');
                  }}
                />
                {username !== user.username && (
                  <span
                    className={
                      usernameDisponibile
                        ? styles.disponibile
                        : styles.nonDisponibile
                    }
                  >
                    {usernameDisponibile
                      ? 'Username disponibile ✅'
                      : 'Username non disponibile ❌'}
                  </span>
                )}
              </>
            ) : (
              <span className={styles.value}>{user.username}</span>
            )}
          </div>

          {feedback && <p className={styles.feedback}>{feedback}</p>}

          <div className={styles.actions}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}>
                Modifica profilo
              </button>
            ) : (
              <>
                <button
                  onClick={handleSalva}
                  disabled={!hasChanges || !usernameDisponibile}
                >
                  Salva modifiche
                </button>
                <button
                  onClick={handleAnnulla}
                  className={styles.secondary}
                >
                  Annulla
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => {
              dispatch(clearUser());
              navigate('/login');
            }}
            className={styles.logoutButton}
          >
            Logout
          </button>

          <div className={styles.postsList}>
            <h3>I tuoi post</h3>
            {postsStatus === 'loading' && <p>Caricamento post…</p>}

            {postsStatus === 'succeeded' && sortedUserPosts.length > 0 && (
              <div className={styles.postsGrid}>
                {sortedUserPosts.map(p => (
                  <div key={p.id} className={styles.postItem}>
                    <PostCard
                      post={p}
                      onViewDetail={handleViewDetail}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}

            {postsStatus === 'succeeded' && sortedUserPosts.length === 0 && (
              <p>Non hai ancora creato post.</p>
            )}
            {postsStatus === 'failed' && (
              <p>Errore nel caricamento dei post.</p>
            )}
          </div>
        </>
      )}

      {detailPost && (
        <DetailPostPage
          post={detailPost}
          onClose={handleCloseDetail}
        />
      )}

      {editingPost && (
        <PostModal
          mode="edit"
          initialData={editingPost}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
}
