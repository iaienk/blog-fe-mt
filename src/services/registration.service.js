const BASE_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.text(); // fallback se non è JSON
    throw new Error(errorData || "Registrazione fallita.");
  }

  return await res.json();
};