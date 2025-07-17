import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
// import Footer from '../components/Footer'

const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  )
}

export default Layout
