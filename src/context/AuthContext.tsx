"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface RmlnUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  favoriteClub: string;
  role?: string;
}

interface AuthContextType {
  user: RmlnUser | null;
  login: (emailOrUser: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, pass: string, club: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

const DEFAULT_DEMO_USER: RmlnUser = {
  id: "rmln-user-1",
  username: "football_fan",
  email: "fan@rmln.football",
  displayName: "Somchai Footballer",
  favoriteClub: "Arsenal",
  role: "member",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RmlnUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("rmln_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEFAULT_DEMO_USER);
      }
    } else {
      setUser(DEFAULT_DEMO_USER);
      localStorage.setItem("rmln_user", JSON.stringify(DEFAULT_DEMO_USER));
    }
  }, []);

  const login = async (emailOrUser: string, pass: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username: emailOrUser, password: pass }),
      });

      const data = await res.json();
      if (res.ok && data?.user) {
        const u = data.user;
        const loggedUser: RmlnUser = {
          id: u.id,
          username: u.username,
          email: u.email,
          displayName: u.display_name || u.username,
          favoriteClub: u.favorite_club || "Arsenal",
          role: u.role || "member",
        };
        setUser(loggedUser);
        localStorage.setItem("rmln_user", JSON.stringify(loggedUser));
        return { success: true };
      }
      return { success: false, error: data?.error || "เข้าสู่ระบบไม่สำเร็จ" };
    } catch {
      // Local fallback
      const newUser: RmlnUser = {
        id: `user-${Date.now()}`,
        username: emailOrUser.split("@")[0],
        email: emailOrUser.includes("@") ? emailOrUser : `${emailOrUser}@rmln.football`,
        displayName: emailOrUser.split("@")[0],
        favoriteClub: "Arsenal",
        role: "member",
      };
      setUser(newUser);
      localStorage.setItem("rmln_user", JSON.stringify(newUser));
      return { success: true };
    }
  };

  const register = async (username: string, email: string, pass: string, club: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", username, email, password: pass, favoriteClub: club }),
      });

      const data = await res.json();
      if (res.ok && data?.user) {
        const u = data.user;
        const newUser: RmlnUser = {
          id: u.id,
          username: u.username,
          email: u.email,
          displayName: u.display_name || u.username,
          favoriteClub: u.favorite_club || club || "Arsenal",
          role: u.role || "member",
        };
        setUser(newUser);
        localStorage.setItem("rmln_user", JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false, error: data?.error || "สมัครสมาชิกไม่สำเร็จ" };
    } catch {
      // Local fallback
      const newUser: RmlnUser = {
        id: `user-${Date.now()}`,
        username,
        email,
        displayName: username,
        favoriteClub: club || "Arsenal",
        role: "member",
      };
      setUser(newUser);
      localStorage.setItem("rmln_user", JSON.stringify(newUser));
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rmln_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
