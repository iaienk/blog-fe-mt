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

useEffect(() => {
  const token = user?.accessToken;
  if (token) {
    connectSocket();
  }
}, [user]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}