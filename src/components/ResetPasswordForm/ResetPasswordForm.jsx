import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/password.service';
import styles from './ResetPasswordForm.module.scss';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError('Inserisci un indirizzo email valido');
      return;
    }

    try {
      setSubmitting(true);
      const res = await requestPasswordReset(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Richiedi Reset Password</h2>

      {message && (
        <div className={`${styles.feedback} ${styles.success}`}>
          {message}
        </div>
      )}
      {error && (
        <div className={`${styles.feedback} ${styles.error}`}>
          {error}
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Email"
              className={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={styles.submitButton}
          >
            {submitting ? 'Invio in corso…' : 'Invia Richiesta'}
          </button>
        </form>
      )}
    </div>
  );
}