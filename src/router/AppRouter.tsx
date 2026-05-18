import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layouth';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import { ProtectedRoute } from '../components/auth/ProtectedRouthe';


export default function AppRouter() {
  return (
    <BrowserRouter>
        <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Login />} />

            {/* Rutas protegidas */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>
      </Routes>
    </BrowserRouter>
  )
}