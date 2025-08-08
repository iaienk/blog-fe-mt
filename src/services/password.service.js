const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Richiede l’invio di un’email per il reset della password.
 * @param {string} email - Indirizzo email dell’utente.
 * @returns {Promise<{ message: string }>}
 */

export async function requestPasswordReset(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Inserisci un indirizzo email valido');
  }

  const res = await fetch(`${BASE_URL}/user/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Errore nella richiesta di reset');
  }
  return data;
}

/**
 * Verifica se il token di reset è valido.
 * @param {string} token - Token di 10 caratteri.
 * @returns {Promise<{ valid: boolean; message: string }>}
 */
export async function validateResetToken(token) {
  if (typeof token !== 'string' || token.length !== 10) {
    throw new Error('Token non valido (deve essere una stringa di 10 caratteri)');
  }

  const res = await fetch(`${BASE_URL}/user/validate-reset-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Errore nella validazione del token');
  }
  return data;
}

/**
 * Invia la nuova password insieme al token di reset.
 * @param {string} token - Token di reset (10 caratteri).
 * @param {string} password - Nuova password (minimo 6 caratteri).
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword(token, password) {
  console.log('[DEBUG resetPassword] token, password:', token, password);
  console.log('[DEBUG resetPassword] URL gonna be:', `${BASE_URL}/user/reset-password`);
  if (typeof token !== 'string' || token.length !== 10) {
    throw new Error('Token non valido');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new Error('La password deve essere di almeno 6 caratteri');
  }

  const res = await fetch(`${BASE_URL}/user/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Errore nel reset della password');
  }
  return data;
}