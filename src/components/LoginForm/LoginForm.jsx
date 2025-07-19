import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginForm.module.scss";
import { loginUser } from "../../services/login.service";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = await loginUser(formData);
      // es. data.accessToken
      localStorage.setItem("accessToken", data.accessToken);
      setSuccess("Login eseguito con successo!");
      setTimeout(() => navigate("/utente"), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Login</h2>

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

      <button type="submit">Accedi</button>

      <p className={styles.recovery}>
        Hai dimenticato la password?{" "}
        <Link to="/recupero-password">Recuperala qui</Link>
      </p>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
};

export default LoginForm;
