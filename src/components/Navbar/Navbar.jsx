import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './navbar.module.scss';
import logo from '../../assets/logo.svg';
import { ThemeContext } from '../../context/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={logo} alt="The iaienk's Blog" className={styles.logoImg} />
        </Link>
      </div>

      <ul className={styles.navLinks}>
        <li className={isActive('/') ? styles.active : ''}>
          <Link to="/">Home</Link>
        </li>
        <li className={isActive('/login') ? styles.active : ''}>
          <Link to="/login">Login</Link>
        </li>
        <li className={isActive('/register') ? styles.active : ''}>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <button onClick={toggleTheme} className={styles.themeToggle}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;