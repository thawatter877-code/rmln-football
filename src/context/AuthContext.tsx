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
  login: (emailOrUser: string, pass: string) => Promise<boolean>;
  register: (username: string, email: string, pass: string, club: string) => Promise<boolean>;
  logout: () => void;
  updateUserEconomy: (deltaCoins: number, deltaGems: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUserEconomy: () => {},
});

const DEFAULT_DEMO_USER: RmlnUser = {
  id: "rmln-user-1",
  username: "magic_fan",
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
      // Default initial logged in user so user can test immediately
      setUser(DEFAULT_DEMO_USER);
      localStorage.setItem("rmln_user", JSON.stringify(DEFAULT_DEMO_USER));
    }
  }, []);

  const login = async (emailOrUser: string, _pass: string) => {
    const newUser: RmlnUser = {
      ...DEFAULT_DEMO_USER,
      username: emailOrUser.split("@")[0],
      email: emailOrUser.includes("@") ? emailOrUser : `${emailOrUser}@rmln.football`,
      displayName: emailOrUser.split("@")[0],
    };
    setUser(newUser);
    localStorage.setItem("rmln_user", JSON.stringify(newUser));
    return true;
  };

  const register = async (username: string, email: string, _pass: string, club: string) => {
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
    return true;
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
