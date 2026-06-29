import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { carService } from '../services/api';

const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return `${window.location.protocol}//${window.location.host}`;
};

const API_URL = getApiUrl();

export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  username: string;
  role: 'admin' | 'vendedor' | 'owner';
  activo: boolean;
  creado_en: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: { nombre?: string; email?: string; telefono?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export interface RegisterData {
  nombre: string;
  email: string;
  telefono: string;
  username: string;
  password: string;
  role?: 'admin' | 'vendedor';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Al montar: cargar token y validarlo contra el servidor
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      if (!savedToken || !savedUser) {
        setLoading(false);
        return;
      }

      // Validar token contra el servidor
      try {
        const r = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (!r.ok) {
          // Token inválido o usuario desactivado — limpiar sesión
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setLoading(false);
          return;
        }
        const freshUser: User = await r.json();
        // Actualizar con datos frescos del servidor
        localStorage.setItem('auth_user', JSON.stringify(freshUser));
        setToken(savedToken);
        setUser(freshUser);
      } catch {
        // Sin conexión al servidor — usar datos guardados como fallback
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }

      setLoading(false);
    };

    init();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error en el login');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...userData, role: userData.role || 'vendedor' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error en el registro');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { nombre?: string; email?: string; telefono?: string }) => {
    await carService.updateProfile(data);
    // Actualizar usuario en estado y localStorage
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('auth_user', JSON.stringify(updated));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await carService.changePassword(currentPassword, newPassword);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin' || user?.role === 'owner',
    isOwner: user?.role === 'owner',
    login,
    register,
    logout,
    clearError,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe ser usado dentro de AuthProvider');
  return context;
};

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'vendedor' | 'any';
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'any',
  fallback = null,
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  if (!isAuthenticated) return fallback || <div className="flex items-center justify-center min-h-screen">Debes iniciar sesión</div>;
  if (requiredRole === 'admin' && !isAdmin) return fallback || <div className="flex items-center justify-center min-h-screen">Acceso denegado</div>;

  return <>{children}</>;
};
