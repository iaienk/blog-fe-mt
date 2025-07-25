import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SocketProvider from './context/SocketProvider.jsx';
import { store, persistor } from './store/store';
import ThemeProvider from './context/ThemeProvider';
import App from './App.jsx';
import './styles/index.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <SocketProvider>
            <App />
          </SocketProvider>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  </StrictMode>
);