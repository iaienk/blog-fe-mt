import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../reducers/user.slice';
import styles from './LoginForm.module.scss';

export default function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1) Login…
      const loginRes = await fetch('/user/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!loginRes.ok) throw new Error('Login fallito');
      const userData = await loginRes.json();
      // { id, email, accessToken, refreshToken }

      // 2) “Maschero” il GET /user/profile via PATCH vuoto
      const profiloRes = await fetch('/user/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.accessToken}`
        },
        body: JSON.stringify({})
      });
      if (!profiloRes.ok) throw new Error('Impossibile recuperare il profilo');
      const profilo = await profiloRes.json();
      // { message, id, email, username, avatar }

      // 3) Merge token + profilo ed effettua il dispatch di setUser
      const fullUser = { 
        ...userData,    // accessToken & refreshToken
        ...profilo      // username, avatar, message…
      };
      dispatch(setUser(fullUser));

      // 4) Naviga al profilo
      navigate('/profile');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Accedi</h2>
      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.field}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <p className={styles.placeholderMsg}> </p>
      </div>

      <div className={styles.field}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <p className={styles.placeholderMsg}> </p>
      </div>

      <button type="submit">Login</button>

      <div className={styles.footerText}>
        <a href="/recupera-password">Hai dimenticato la password?</a>
      </div>
    </form>
  );
}