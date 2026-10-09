import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingState from './components/LoadingState'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import TodayOutfit from './pages/TodayOutfit'
import Wardrobe from './pages/Wardrobe'
import AddGarment from './pages/AddGarment'
import SavedOutfits from './pages/SavedOutfits'

function Protected({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <LoadingState text="Verificando sesión…" full />
  return session ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<TodayOutfit />} />
        <Route path="armario" element={<Wardrobe />} />
        <Route path="agregar" element={<AddGarment />} />
        <Route path="outfits" element={<SavedOutfits />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
