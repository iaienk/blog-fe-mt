import { useState } from "react";
import styles from "./RecuperoPassword.module.scss";
import { requestPasswordReset } from "../../services/password.service";

const RecuperoPassword = () => {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");
    setError("");

    try {
      await requestPasswordReset(email);
      setFeedback("Se l'email è registrata, riceverai istruzioni per il reset.");
    } catch (err) {
      setError(err.message || "Errore durante la richiesta.");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Recupera Password</h2>

      <input
        type="email"
        name="email"
        placeholder="Inserisci la tua email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button type="submit">Invia</button>

      {feedback && <p className={styles.success}>{feedback}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
};

export default RecuperoPassword;
