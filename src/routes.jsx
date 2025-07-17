import { Route, Routes } from 'react-router-dom'
import Layout from './layouts/MainLayout'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './components/LoginForm/LoginForm.jsx'
import RegisterPage from './components/RegistrationForm/RegistrationForm.jsx'
import RecuperoPassword from './components/RecuperoPassword/RecuperoPassword.jsx'
// import ProfilePage from './pages/ProfilePage'
// import PostPage from './pages/PostPage'

const routes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="recupero-password" element={<RecuperoPassword />} />
        {/* <Route path="profile" element={<ProfilePage />} />
        <Route path="post/:id" element={<PostPage />} /> */}
      </Route>
    </Routes>
  )
}

export default routes