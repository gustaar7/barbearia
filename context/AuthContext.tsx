"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  nome: string;
  email: string;
  telefone: string | null;
  fotoUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, telefone: string) => Promise<void>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

const API = "https://barbearia-production-667f.up.railway.app";
const TOKEN_KEY = "barber_token";
const USER_KEY  = "barber_user";

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser  = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const persist = (t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = async (email: string, senha: string) => {
    const res = await fetch(`${API}/auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Email ou senha inválidos");
    }
    const data = await res.json();
    persist(data.token, {
      nome: data.nome, email: data.email,
      telefone: data.telefone, fotoUrl: data.fotoUrl,
    });
  };

  const register = async (nome: string, email: string, senha: string, telefone: string) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, telefone }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Erro ao criar conta");
    }
    const data = await res.json();
    persist(data.token, {
      nome: data.nome, email: data.email,
      telefone: data.telefone, fotoUrl: data.fotoUrl,
    });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    setUser(next);
    localStorage.setItem(USER_KEY, JSON.stringify(next));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Typed fetch helper (attaches Bearer token automatically) ─────────────────
export function useApiFetch() {
  const { token, logout } = useAuth();

  return async (path: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API}${path}`, { ...options, headers });

    if (res.status === 401) { logout(); throw new Error("Sessão expirada"); }
    return res;
  };
}
