import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./RegistrationForm.module.scss";
import { registerUser } from "../../services/registration.service";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await registerUser(formData);
      setSuccess("Registrazione completata con successo!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // Qui mostriamo sempre il messaggio specifico
      setError(err.message);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Registrati</h2>

      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button type="submit">Registrati</button>

      <p className={styles.footerText}>
        Hai già un account? <Link to="/login">Accedi qui</Link>
      </p>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
};

export default RegistrationForm;
