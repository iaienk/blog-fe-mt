import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./RegistrationForm.module.scss";
import { registerUser } from "../../services/registration.service";
import { checkUsernameAvailability } from "../../services/user.service";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "username") {
      setUsernameAvailable(null);
    }
  };

  const handleUsernameBlur = async () => {
    const user = formData.username.trim();
    if (user.length < 3) {
      setUsernameAvailable(false);
      return;
    }
    setCheckingUsername(true);
    setError("");
    try {
      const available = await checkUsernameAvailability(user);
      setUsernameAvailable(available);
    } catch (err) {
      setError(err.message);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // blocca solo se le due password non corrispondono completamente
    if (formData.password !== formData.confirm) {
      setError("Le password non corrispondono.");
      return;
    }
    if (usernameAvailable === false) {
      setError("Scegli un username diverso, questo è già in uso.");
      return;
    }

    try {
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setSuccess("Registrazione completata con successo!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Registrati</h2>

      {/* USERNAME */}
      <div className={styles.field}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleUsernameBlur}
          required
        />
        {checkingUsername && <span className={styles.note}>Controllo...</span>}
        {usernameAvailable === true && (
          <span className={styles.successMsg}>Username disponibile ✅</span>
        )}
        {usernameAvailable === false && (
          <span className={styles.errorMsg}>Username non disponibile ❌</span>
        )}
      </div>

      {/* EMAIL */}
      <div className={styles.field}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <span className={styles.placeholderMsg} />
      </div>

      {/* PASSWORD */}
      <div className={styles.field}>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <span className={styles.placeholderMsg} />
      </div>

      {/* CONFIRM PASSWORD */}
      <div className={styles.field}>
        <input
          type="password"
          name="confirm"
          placeholder="Conferma Password"
          value={formData.confirm}
          onChange={handleChange}
          required
        />
        {/* errore appena differenza di carattere */}
        {formData.confirm &&
          !formData.password.startsWith(formData.confirm) && (
            <span className={styles.errorMsg}>
              Le password non corrispondono ❌
            </span>
          )}
        {/* successo solo se confirm non è vuoto, lunghezze uguali e stringhe identiche */}
        {formData.confirm.length > 0 &&
          formData.confirm.length === formData.password.length &&
          formData.confirm === formData.password && (
            <span className={styles.successMsg}>
              Password corrispondono ✅
            </span>
          )}
      </div>

      <button
        type="submit"
        disabled={
          checkingUsername ||
          usernameAvailable === false ||
          formData.password !== formData.confirm
        }
      >
        Registrati
      </button>

      <p className={styles.footerText}>
        Hai già un account? <Link to="/login">Accedi qui</Link>
      </p>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  );
};

export default RegistrationForm;