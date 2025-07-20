// src/services/user.service.js
const BASE_URL = import.meta.env.VITE_API_URL;


export const checkUsernameAvailability = async (username) => {
  const res = await fetch(`${BASE_URL}/user/check-username/${encodeURIComponent(username)}`);
  if (!res.ok) {
    if (res.status === 400) {
      throw new Error("Username non valido (3–30 caratteri alfanumerici).");
    }
    throw new Error(`Errore server: ${res.status}`);
  }
  const data = await res.json();
  return data.available; // true|false
};

export async function updateUserProfile(formData) {
  const response = await fetch(`${BASE_URL}/user/update-profile`, {
    method: 'PUT',
    credentials: 'include', // se usi sessioni/cookies
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Errore aggiornamento profilo');
  }

  return response.json();
}