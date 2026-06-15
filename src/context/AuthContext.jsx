import { createContext, useContext, useState, useCallback } from "react";
import { authApi, IS_MOCK } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "itam_auth_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      const loggedUser = response?.user || response;

      if (!loggedUser?.role) throw new Error("Respuesta de autenticación inválida");

      setUser(loggedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
      return loggedUser;
    } catch (e) {
      const message =
        e?.message?.toLowerCase().includes("401") ||
        e?.message?.toLowerCase().includes("unauthorized")
          ? "Correo o contraseña incorrectos"
          : e?.message || "No se pudo iniciar sesión. Intenta de nuevo.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isTechnician: user?.role === "technician",
        isMockMode: IS_MOCK,
        loading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}
