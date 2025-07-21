import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { socket } from '../../socket';
import styles from './ProfiloUtente.module.scss';
import { uploadImageToCloudinary } from '../../utils/uploadImage';

const PLACEHOLDER = '/images/avatar-placeholder.png';

export default function ProfiloUtente() {
  const { user, setUser } = useContext(AuthContext);

  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar]     = useState(user?.avatar   || PLACEHOLDER);
  const [nuovoAvatarUrl, setNuovoAvatarUrl] = useState(null);
  const [usernameDisponibile, setUsernameDisponibile] = useState(true);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  // Sincronizzo quando cambia user
  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setAvatar(user.avatar || PLACEHOLDER);
  }, [user]);

  // Controllo disponibilità username
  useEffect(() => {
    if (!user || username === user.username) return;
    const timer = setTimeout(() => socket.emit('checkUsername', username), 500);
    return () => clearTimeout(timer);
  }, [username, user]);

  // Ricevo eventi socket e pulisco al dismount
  useEffect(() => {
    const onAvail   = ({ available }) => setUsernameDisponibile(available);
    const onUpdated = updated => {
      setUser({ ...user, ...updated });
      setFeedback('Profilo aggiornato con successo!');
    };
    const onError   = msg => setFeedback(msg || 'Errore durante l’aggiornamento.');

    socket.on('usernameAvailability', onAvail);
    socket.on('profileUpdated',       onUpdated);
    socket.on('updateError',          onError);

    return () => {
      socket.off('usernameAvailability', onAvail);
      socket.off('profileUpdated',       onUpdated);
      socket.off('updateError',          onError);
    };
  }, [user, setUser]);

  // Upload avatar su Cloudinary
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

  // Salvo le modifiche (username + eventualmente avatar URL)
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
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(body)
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

  // Early-return se non autenticato
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
      <div className={styles.avatar}>
        <img src={avatar} alt="Avatar utente" />
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
      </div>

     <div className={styles.infoUtente}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={user.email}
          readOnly
        />
     </div>

      <div className={styles.infoUtente}>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
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
      </div>

      <button onClick={handleSalva}>Salva modifiche</button>
      {feedback && <p className={styles.feedback}>{feedback}</p>}
    </div>
  );
}
