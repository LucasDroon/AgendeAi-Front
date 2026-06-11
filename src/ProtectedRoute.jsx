// src/components/ProtectedRoute.jsx
// Redireciona para /login se o usuário não estiver autenticado

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Salva a rota atual para redirecionar de volta após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
