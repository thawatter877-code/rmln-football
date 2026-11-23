"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface RmlnUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  favoriteClub: string;
  coins: number;
  gems: number;
  academyLevel: string;
  squadCount: number;
  maxSquad: number;
  role: string;
}

type Result = { success: boolean; error?: string };

interface AuthContextType {
  user: RmlnUser | null;
  /** true until the initial session check finishes */
  loading: boolean;
  isAdmin: boolean;
  login: (emailOrUser: string, pass: string) => Promise<Result>;
  register: (username: string, email: string, pass: string, club: string) => Promise<Result>;
  logout: () => Promise<void>;
  /** Replace the user with a fresh copy returned by the server (e.g. after spending coins) */
  setUserFromServer: (raw: any) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  setUserFromServer: () => {},
  refresh: async () => {},
});

export function mapUser(u: any): RmlnUser | null {
  if (!u?.id) return null;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    displayName: u.display_name || u.username,
    favoriteClub: u.favorite_club || "",
    coins: u.coins ?? 0,
    gems: u.gems ?? 0,
    academyLevel: u.academy_level || "D4",
    squadCount: u.squad_count ?? 0,
    maxSquad: u.max_squad ?? 50,
    role: u.role || "member",
  };
}

async function postAuth(body: Record<string, unknown>) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RmlnUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      setUser(res.ok ? mapUser(data?.user) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clean up the old fake "demo user" that previous versions stored in localStorage
    try {
      localStorage.removeItem("rmln_user");
    } catch {}
    refresh();
  }, [refresh]);

  const login = async (emailOrUser: string, pass: string): Promise<Result> => {
    try {
      const { res, data } = await postAuth({ action: "login", username: emailOrUser, password: pass });
      const u = mapUser(data?.user);
      if (res.ok && u) {
        setUser(u);
        return { success: true };
      }
      return { success: false, error: data?.error || "เข้าสู่ระบบไม่สำเร็จ" };
    } catch {
      return { success: false, error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่" };
    }
  };

  const register = async (username: string, email: string, pass: string, club: string): Promise<Result> => {
    try {
      const { res, data } = await postAuth({ action: "register", username, email, password: pass, favoriteClub: club });
      const u = mapUser(data?.user);
      if (res.ok && u) {
        setUser(u);
        return { success: true };
      }
      return { success: false, error: data?.error || "สมัครสมาชิกไม่สำเร็จ" };
    } catch {
      return { success: false, error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่" };
    }
  };

  const logout = async () => {
    await postAuth({ action: "logout" }).catch(() => {});
    setUser(null);
  };

  const setUserFromServer = (raw: any) => {
    const u = mapUser(raw);
    if (u) setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.role === "admin", login, register, logout, setUserFromServer, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
