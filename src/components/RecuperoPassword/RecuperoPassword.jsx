import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { validateResetToken, resetPassword } from '../../services/password.service';

export default function RecuperoPassword() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || params.token || '';

  const [status, setStatus]      = useState('checking');
  const [password, setPassword]  = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError]        = useState(null);
  const [success, setSuccess]    = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    validateResetToken(token)
      .then(() => setStatus('ready'))
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPwd) {
      setError('Le password non corrispondono');
      return;
    }
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      setSubmitting(true);
      const res = await resetPassword(token, password);
      setSuccess(res.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'checking') return <p>Verifico il token…</p>;
  if (status === 'invalid')  return <p style={{ color: 'red' }}>Token non valido o scaduto.</p>;

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Reimposta la Password</h2>
      {error   && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
      {!success && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Nuova password"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              required
              minLength={6}
              placeholder="Conferma password"
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <button type="submit" disabled={submitting} style={{ padding: '0.5rem 1rem', width: '100%' }}>
            {submitting ? 'Invio in corso…' : 'Reimposta Password'}
          </button>
        </form>
      )}
    </div>
  );
}