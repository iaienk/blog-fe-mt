const BASE_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  // leggiamo sempre come testo per non sbattere su un HTML di errore
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }

  if (!res.ok) {
    // payload.code === "REGISTER_FAILED" è l'unico codice che torniamo oggi
    // 👉 HACK: mostrare messaggio più user-friendly fino a quando il BE non invierà codici specifici.
    if (payload?.code === "REGISTER_FAILED") {
      throw new Error("Username o email già registrati.");
    }

    // altrimenti prova a pescare payload.message o fallback generico
    const msg =
      payload?.message?.trim() ||
      (typeof payload === "string" ? payload.trim() : "") ||
      `Errore ${res.status}`;

    throw new Error(msg);
  }

  // in caso di successo restituiamo il JSON (o null se payload non JSON)
  return typeof payload === "object" ? payload : null;
};