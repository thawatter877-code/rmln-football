"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
}

interface AuthContextType {
  user: RmlnUser | null;
  login: (emailOrUser: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, pass: string, club: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserEconomy: (deltaCoins: number, deltaGems: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateUserEconomy: () => {},
});

const DEFAULT_DEMO_USER: RmlnUser = {
  id: "rmln-user-1",
  username: "football_fan",
  email: "fan@rmln.football",
  displayName: "Somchai Magician",
  favoriteClub: "Arsenal",
  coins: 198000,
  gems: 282,
  academyLevel: "D4",
  squadCount: 23,
  maxSquad: 50,
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
          coins: u.coins ?? 198000,
          gems: u.gems ?? 282,
          academyLevel: u.academy_level || "D4",
          squadCount: u.squad_count ?? 23,
          maxSquad: u.max_squad ?? 50,
        };
        setUser(loggedUser);
        localStorage.setItem("rmln_user", JSON.stringify(loggedUser));
        return { success: true };
      }
      return { success: false, error: data?.error || "เข้าสู่ระบบไม่สำเร็จ" };
    } catch {
      // Local fallback
      const newUser: RmlnUser = {
        ...DEFAULT_DEMO_USER,
        username: emailOrUser.split("@")[0],
        email: emailOrUser.includes("@") ? emailOrUser : `${emailOrUser}@rmln.football`,
        displayName: emailOrUser.split("@")[0],
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
          coins: u.coins ?? 198000,
          gems: u.gems ?? 282,
          academyLevel: u.academy_level || "D4",
          squadCount: u.squad_count ?? 23,
          maxSquad: u.max_squad ?? 50,
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
        coins: 198000,
        gems: 282,
        academyLevel: "D4",
        squadCount: 23,
        maxSquad: 50,
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

  const updateUserEconomy = (deltaCoins: number, deltaGems: number) => {
    if (!user) return;
    const updated = {
      ...user,
      coins: Math.max(0, user.coins + deltaCoins),
      gems: Math.max(0, user.gems + deltaGems),
      squadCount: Math.min(user.maxSquad, user.squadCount + 1),
    };
    setUser(updated);
    localStorage.setItem("rmln_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserEconomy }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
