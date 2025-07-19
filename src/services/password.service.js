const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Invia l’email per richiedere il reset
 */
export const requestPasswordReset = async (email) => {
  const res = await fetch(`${BASE_URL}/user/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = null; }

  if (!res.ok) {
    if (res.status === 404) throw new Error("Indirizzo email non registrato.");
    throw new Error(data?.message || `Errore ${res.status}: ${text}`);
  }

  return data;
};

/**
 * Completa il reset usando il token via query param
 */
export const resetPassword = async (token, newPassword) => {
  const url = `${BASE_URL}/user/reset-password?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: newPassword }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = null; }

  if (!res.ok) {
    if (res.status === 400) throw new Error(data?.message || "Token non valido o scaduto.");
    throw new Error(data?.message || `Errore ${res.status}`);
  }

  return data;
};