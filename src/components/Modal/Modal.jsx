import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.scss';

const Modal = ({ children, onClose, className = '' }) => {
  // chiude con ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // blocca scroll body quando aperto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // clic su overlay chiude
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${className}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Chiudi">
          ×
        </button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') // assicurati che esista in index.html
  );
};

export default Modal;