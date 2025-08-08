import { Route, Routes } from 'react-router-dom'
import Layout from './layouts/MainLayout'
import HomePage from './pages/HomePage/HomePage.jsx'
import LoginPage from './components/LoginForm/LoginForm.jsx'
import RegisterPage from './components/RegistrationForm/RegistrationForm.jsx'
import ResetPasswordForm from './components/ResetPasswordForm/ResetPasswordForm.jsx'
import RecuperoPassword from './components/RecuperoPassword/RecuperoPassword.jsx'
import ProfiloUtente from './components/ProfiloUtente/ProfiloUtente.jsx'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route path="recupera-password" element={<ResetPasswordForm />} />

        <Route path="reset-password" element={<RecuperoPassword />} />
        <Route path="reset-password/:token" element={<RecuperoPassword />} />
        <Route path="profile" element={<ProfiloUtente />} />
      
      </Route>
    </Routes>
  )
}

export default AppRoutes