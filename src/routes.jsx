import { Route, Routes } from 'react-router-dom'
import Layout from './layouts/MainLayout'
import HomePage from './pages/HomePage/HomePage.jsx'
import LoginPage from './components/LoginForm/LoginForm.jsx'
import RegisterPage from './components/RegistrationForm/RegistrationForm.jsx'
import ResetPasswordForm from './components/ResetPasswordForm/ResetPasswordForm.jsx'
import RecuperoPassword from './components/RecuperoPassword/RecuperoPassword.jsx'
import ProfiloUtente from './components/ProfiloUtente/ProfiloUtente.jsx'
// import PostPage from './pages/PostPage'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Home e autenticazione */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* 1) Form per richiedere il link di reset via email */}
        <Route path="recupera-password" element={<ResetPasswordForm />} />

        {/* 2) Form per impostare la nuova password, con token in URL */}
        <Route path="reset-password" element={<RecuperoPassword />} />
        <Route path="reset-password/:token" element={<RecuperoPassword />} />
        <Route path="profile" element={<ProfiloUtente />} />
        {/* <Route path="post/:id" element={<PostPage />} /> */}
      
      </Route>
    </Routes>
  )
}

export default AppRoutes