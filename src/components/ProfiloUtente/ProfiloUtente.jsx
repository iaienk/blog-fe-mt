import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userSelector, setUser, clearUser } from '../../reducers/user.slice';
import { useSocketContext } from '../../context/SocketProvider';
import PostCard from '../PostCard/PostCard';
import styles from './ProfiloUtente.module.scss';
import { uploadImageToCloudinary } from '../../utils/uploadImage';
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus
} from '../../reducers/post.slice';

const PLACEHOLDER =
  'https://res.cloudinary.com/dkijvk8aq/image/upload/v1753049295/profilePlaceholder.webp';

export default function ProfiloUtente() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(userSelector);
  const { socket, socketReady } = useSocketContext();

  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || PLACEHOLDER);
  const [nuovoAvatarUrl, setNuovoAvatarUrl] = useState(null);
  const [usernameDisponibile, setUsernameDisponibile] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const allPosts = useSelector(selectAllPosts);
  const userPosts = allPosts.filter(p => p.authorId === user?.id);
  const postsStatus= useSelector(selectPostsStatus);

    useEffect(() => {
    if (postsStatus === 'idle') {
      dispatch(fetchPosts());
    }
  }, [postsStatus, dispatch]);

    const sortedUserPosts = useMemo(() => {
    return [...userPosts].sort((a, b) => {
      const tA = new Date(a.publishDate).getTime();
      const tB = new Date(b.publishDate).getTime();
      return tB - tA;
    });
  }, [userPosts]);
  
  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setAvatar(user.avatar || PLACEHOLDER);
    setIsEditing(false);
  }, [user]);

  

  useEffect(() => {
    let timeoutId;
    if (feedback === 'Profilo aggiornato con successo!') {
      timeoutId = setTimeout(() => setFeedback(''), 2000);
    }
    return () => timeoutId && clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    let timeoutId;
    if (socketReady && isEditing && username !== user.username) {
      timeoutId = setTimeout(() => socket.emit('checkUsername', username), 500);
    }
    return () => timeoutId && clearTimeout(timeoutId);
  }, [username, user.username, socket, socketReady, isEditing]);

  useEffect(() => {
    if (!socketReady || !socket) return;
    const onAvail = ({ available }) => setUsernameDisponibile(available);
    const onUpdated = updated => {
      dispatch(setUser({ ...user, ...updated }));
      setFeedback('Profilo aggiornato con successo!');
    };
    const onError = msg => setFeedback(msg || 'Errore durante l’aggiornamento.');

    socket.on('usernameAvailability', onAvail);
    socket.on('profileUpdated', onUpdated);
    socket.on('updateError', onError);

    return () => {
      socket.off('usernameAvailability', onAvail);
      socket.off('profileUpdated', onUpdated);
      socket.off('updateError', onError);
    };
  }, [socket, socketReady, dispatch, user]);

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setFeedback('Caricamento avatar in corso…');
      const url = await uploadImageToCloudinary(file);
      setNuovoAvatarUrl(url);
      setAvatar(url);
      setFeedback('');
    } catch (err) {
      console.error('[ProfiloUtente] uploadError:', err);
      setFeedback('Errore durante l’upload dell’avatar');
    }
  };

  const handleSalva = async () => {
    if (!usernameDisponibile) return setFeedback('Username non disponibile!');
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
      if (!res.ok) throw new Error('Aggiornamento fallito');
      const updated = await res.json();
      dispatch(setUser({ ...user, ...updated }));
      setFeedback('Profilo aggiornato con successo!');
    } catch (err) {
      console.error('[ProfiloUtente] updateError:', err);
      setFeedback(err.message);
    }
  };

  const handleAnnulla = () => {
    setUsername(user.username);
    setAvatar(user.avatar || PLACEHOLDER);
    setNuovoAvatarUrl(null);
    setFeedback('');
    setIsEditing(false);
  };

  return (
    <div className={styles.containerProfilo}>
      {!user ? (
        <>
          <p>Devi effettuare il login per accedere al profilo.</p>
          <button onClick={() => navigate('/login')} className={styles.loginButton}>
            Vai al Login
          </button>
        </>
      ) : (
        <>
          <div className={styles.avatar}>
            <img src={avatar} alt="Avatar utente" />
            {isEditing && (
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
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
                  onChange={e => { setUsername(e.target.value); setFeedback(''); }}
                />
                {username !== user.username && (
                  <span
                    className={
                      usernameDisponibile ? styles.disponibile : styles.nonDisponibile
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

          <div className={styles.actions}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}>Modifica profilo</button>
            ) : (
              <>
                <button onClick={handleSalva}>Salva modifiche</button>
                <button onClick={handleAnnulla} className={styles.secondary}>
                  Annulla
                </button>
              </>
            )}
          </div>

          {feedback && <p className={styles.feedback}>{feedback}</p>}

          <button
            onClick={() => {
              dispatch(clearUser());
              navigate('/login');
            }}
            className={styles.logoutButton}
          >
            Logout
          </button>

        </>
      )}
          {/* Sezione post sotto profilo e logout */}
      <div className={styles.postsList}>
        <h3>I tuoi post</h3>

        {postsStatus === 'loading' && <p>Caricamento post…</p>}

        {postsStatus === 'succeeded' && sortedUserPosts.length > 0 && (
          sortedUserPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}

        {postsStatus === 'succeeded' && sortedUserPosts.length === 0 && (
          <p>Non hai ancora creato post.</p>
        )}

        {postsStatus === 'failed' && <p>Errore nel caricamento dei post.</p>}
      </div>
    </div>
  );
}
