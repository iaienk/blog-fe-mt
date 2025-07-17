const BASE_URL = import.meta.env.VITE_API_URL;

export const requestPasswordReset = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Errore nella richiesta.");
  }

  return await res.json();
};