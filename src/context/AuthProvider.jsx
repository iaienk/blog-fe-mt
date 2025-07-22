import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { connectSocket } from '../socket';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // ✅ Salva user e token localmente + connessione socket
  useEffect(() => {
    if (user?.accessToken) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', user.accessToken);  // 🔑 utile anche altrove se serve
      connectSocket(user.accessToken);                  // ✅ passa token attivo
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