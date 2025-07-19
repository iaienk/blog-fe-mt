import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from "./ResetPasswordForm.module.scss";
import { resetPassword } from "../services/password.service";

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Le password non corrispondono.");
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess("Password aggiornata con successo!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return <p className={styles.error}>Token mancante o non valido.</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Nuova Password</h2>

      <input
        type="password"
        name="password"
        placeholder="Nuova password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        name="confirm"
        placeholder="Conferma password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />

      <button type="submit">Aggiorna</button>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
};

export default ResetPasswordForm;
