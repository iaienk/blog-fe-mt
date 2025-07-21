import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getSocket } from '../../socket';
import styles from './ProfiloUtente.module.scss';
import { uploadImageToCloudinary } from '../../utils/uploadImage';

const PLACEHOLDER = '/images/avatar-placeholder.png';
const socket = getSocket();

export default function ProfiloUtente() {
  const { user, setUser } = useContext(AuthContext);

  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || PLACEHOLDER);
  const [nuovoAvatarUrl, setNuovoAvatarUrl] = useState(null);
  const [usernameDisponibile, setUsernameDisponibile] = useState(true);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setAvatar(user.avatar || PLACEHOLDER);
    setIsEditing(false);
  }, [user]);

  useEffect(() => {
    if (feedback === 'Profilo aggiornato con successo!') {
      const timer = setTimeout(() => setFeedback(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    if (!user || username === user.username) return;
    const timer = setTimeout(() => {
      if (socket?.connected) {
        socket.emit('checkUsername', username);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, user, isEditing]);

  useEffect(() => {
    if (!socket?.connected) return;

    const onAvail = ({ available }) => setUsernameDisponibile(available);
    const onUpdated = updated => {
      setUser({ ...user, ...updated });
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
  }, [user, setUser]);

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
    if (!usernameDisponibile) {
      setFeedback('Username non disponibile!');
      return;
    }
    try {
      const body = { username };
      if (nuovoAvatarUrl) body.avatar = nuovoAvatarUrl;

      const res = await fetch('/user/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Aggiornamento fallito');

      const updated = await res.json();
      setUser({ ...user, ...updated });
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

  if (!user) {
    const goToLogin = () => navigate('/login');
    return (
      <div className={styles.containerProfilo}>
        <p>Devi effettuare il login per accedere al profilo.</p>
        <button onClick={goToLogin} className={styles.loginButton}>
          Vai al Login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.containerProfilo}>
      {/* Avatar */}
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
    </div>
  );
}
