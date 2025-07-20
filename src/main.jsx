import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.scss';
import App from './App.jsx';

import ThemeProvider from './context/ThemeProvider';
import {AuthProvider} from './context/AuthProvider';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);