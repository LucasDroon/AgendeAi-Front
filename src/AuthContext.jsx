// src/context/AuthContext.jsx
// Gerencia o estado de autenticação globalmente via Context API

import { createContext, useContext, useState, useCallback } from "react";
import { authService } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);

    // O backend retorna { token: "...", user: { name: "..." } }
    const jwt = data.token || data.access_token;
    const userData = data.user || { name: credentials.email.split('@')[0], email: credentials.email };

    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(jwt);
    setUser(userData);

    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const register = useCallback(async (data) => {
    return authService.register(data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook de conveniência para usar o contexto de auth */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
