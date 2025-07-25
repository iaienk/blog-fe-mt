import React from 'react';
import styles from './HomePage.module.scss';

export default function HomePage() {
  return (
    <div className={styles.home}>
      <h1>Blog in costruzione 🚧</h1>
      <p>Stiamo preparando qualcosa di interessante, torna presto!</p>
      <img
        src="/assets/work-in-progress.svg"
        alt="Lavori in corso"
        className={styles.immagine}
      />
      <section className={styles.features}>
        <h2>Funzionalità già implementate</h2>
        <ul>
          <li><strong>Registrazione</strong> con validazione in tempo reale</li>
          <li><strong>Login</strong> con persistenza e protezione token</li>
          <li><strong>Logout</strong> sicuro e completo</li>
          <li><strong>Modifica profilo utente</strong>:
            <ul>
              <li>Modifica username con verifica disponibilità</li>
              <li>Modifica avatar con upload su Cloudinary</li>
            </ul>
          </li>
          <li><strong>Gestione immagini</strong> integrata con Cloudinary</li>
          <li><strong>Modale post</strong> per inserimento e modifica dei post</li>
          <li><strong>Editor avanzato</strong> con supporto rich text (TipTap)</li>
          <li><strong>Navbar dinamica</strong> in base allo stato utente</li>
          <li><strong>Placeholder Home</strong> in attesa dei primi contenuti</li>
        </ul>
      </section>
    </div>
  );
}