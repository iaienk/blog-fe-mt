const BASE_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (credentials) => {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // non era JSON: fallback al raw text
  }

  if (!res.ok) {
    if (res.status === 401) {
      // credenziali sbagliate
      throw new Error("Email o password non validi");
    }
    // altri errori
    throw new Error(
      data?.message || `Errore ${res.status}: ${text.substring(0, 100)}`
    );
  }

  return data; // { accessToken, ... }
};