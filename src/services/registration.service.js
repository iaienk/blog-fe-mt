const BASE_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }

  if (!res.ok) {

    if (payload?.code === "REGISTER_FAILED") {
      throw new Error("Username o email già registrati.");
    }

    const msg =
      payload?.message?.trim() ||
      (typeof payload === "string" ? payload.trim() : "") ||
      `Errore ${res.status}`;

    throw new Error(msg);
  }

  return typeof payload === "object" ? payload : null;
};