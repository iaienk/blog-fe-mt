import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
  user: null,
  setUser: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // Solo persistenza, niente socket qui
  useEffect(() => {
    if (user?.accessToken) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', user.accessToken);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}