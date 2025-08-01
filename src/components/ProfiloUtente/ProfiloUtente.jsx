import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate }               from 'react-router-dom';
import { useSelector, useDispatch }  from 'react-redux';
import { userSelector, setUser, clearUser } from '../../reducers/user.slice';
import {
  fetchPosts,
  selectAllPosts,
  selectPostsStatus
} from '../../reducers/post.slice';
import { useSocketContext }          from '../../context/SocketProvider';
import PostCard                      from '../PostCard/PostCard';
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

  // 1) Carica i post (fino a 100)
  useEffect(() => {
    if (postsStatus === 'idle') {
      dispatch(fetchPosts({ limit: 100 }));
    }
  }, [postsStatus, dispatch]);

  // 2) Filtra e ordina i post dell'utente
  const sortedUserPosts = useMemo(() => {
    if (!user) return [];
    return allPosts
      .filter(p => p.authorId === user.id)
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
  }, [allPosts, user]);

  // 3) Stati locali
  const [username, setUsername]             = useState(user?.username || '');
  const [avatar, setAvatar]                 = useState(user?.avatar || PLACEHOLDER);
  const [nuovoAvatarUrl, setNuovoAvatarUrl] = useState(null);
  const [usernameDisponibile, setUsernameDisponibile] = useState(true);
  const [feedback, setFeedback]             = useState('');
  const [isEditing, setIsEditing]           = useState(false);

  // serve per abilitare/disabilitare “Salva”
  const hasChanges =
    username !== user?.username ||
    !!nuovoAvatarUrl;

  // 4) Sincronizza i campi quando cambia l'user
  //    → ho rimosso il setFeedback('') per non cancellare il messaggio di conferma
  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setAvatar(user.avatar || PLACEHOLDER);
    setUsernameDisponibile(true);
    // setFeedback('');   ← RIMOSSO
    setNuovoAvatarUrl(null);
  }, [user]);

  // 5) Pulisce il feedback dopo 2s se è il messaggio standard
  useEffect(() => {
    if (feedback === 'Profilo aggiornato con successo!') {
      const t = setTimeout(() => setFeedback(''), 2000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // 6) Debounce + emit con ack
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
  }, [socket, ready, isEditing, username, user.username]);

  // Upload avatar
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

  // 7) Salva profilo con delay sulla chiusura del form
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
      // setto il feedback
      setFeedback('Profilo aggiornato con successo!');
      // chiudo la modalità editing **dopo** 1 secondo
      setIsEditing(false);
    } catch {
      setFeedback('Errore durante il salvataggio');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  // Annulla modifica
  const handleAnnulla = () => {
    setUsername(user.username);
    setAvatar(user.avatar || PLACEHOLDER);
    setNuovoAvatarUrl(null);
    setFeedback('');
    setIsEditing(false);
    setUsernameDisponibile(true);
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
                  onChange={e => {
                    setUsername(e.target.value);
                    setFeedback('');
                  }}
                />
                {username !== user.username && (
                  <span className={
                    usernameDisponibile
                      ? styles.disponibile
                      : styles.nonDisponibile
                  }>
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

          {/* feedback */}
          {feedback && (
            <p className={styles.feedback}>{feedback}</p>
          )}

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
                <button onClick={handleAnnulla} className={styles.secondary}>
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
        </>
      )}

      {/* lista post dell'utente */}
      <div className={styles.postsList}>
        <h3>I tuoi post</h3>
        {postsStatus === 'loading' && <p>Caricamento post…</p>}
        {postsStatus === 'succeeded' && sortedUserPosts.length > 0 &&
          sortedUserPosts.map(post => <PostCard key={post.id} post={post} />)
        }
        {postsStatus === 'succeeded' && sortedUserPosts.length === 0 && (
          <p>Non hai ancora creato post.</p>
        )}
        {postsStatus === 'failed' && <p>Errore nel caricamento dei post.</p>}
      </div>
    </div>
  );
}
