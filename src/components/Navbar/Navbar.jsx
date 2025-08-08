import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiUser, FiEdit } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Navbar.module.scss';
import logo from '../../assets/logo.svg';
import { ThemeContext } from '../../context/ThemeContext';
import { PostModal } from '../PostModal/PostModal.jsx';
import { userSelector, clearUser } from '../../reducers/user.slice.js';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = React.useContext(ThemeContext);

  const user = useSelector(userSelector);
  const isLoggedIn = Boolean(user.accessToken);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(clearUser());
    navigate('/login');
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link to="/">
            <img
              src={logo}
              alt="The iaienk's Blog"
              className={styles.logoImg}
            />
          </Link>
        </div>

        <ul className={styles.navLinks}>
          <li className={isActive('/') ? styles.active : ''}>
            <Link to="/">Home</Link>
          </li>

          {isLoggedIn ? (
            <>
              <li>
                <button
                  onClick={() => setModalOpen(true)}
                  className={styles.newPostButton}
                >
                  <FiEdit className={styles.icon} />
                  Nuovo Post
                </button>
              </li>

              <li className={isActive('/profile') ? styles.active : ''}>
                <Link to="/profile">
                  <FiUser className={styles.icon} /> Profilo
                </Link>
              </li>

              <li>
                <button
                  onClick={handleLogout}
                  className={styles.logoutButton}
                  title="Logout"
                >
                  <FiLogOut className={styles.icon} />
                </button>
              </li>
            </>
          ) : (
            <>
              <li className={isActive('/login') ? styles.active : ''}>
                <Link to="/login">Login</Link>
              </li>

              <li className={isActive('/register') ? styles.active : ''}>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}

          <li>
            <button
              onClick={toggleTheme}
              className={styles.themeToggle}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </li>
        </ul>
      </nav>

      {modalOpen && (
        <PostModal
          mode="create"
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;