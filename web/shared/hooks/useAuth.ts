"use client";

import { useEffect, useState } from "react";
import { getToken } from "../api/client";
import type { User } from "../types";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("fgz_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refresh = () => {
    const token = getToken();
    const stored = getStoredUser();
    setUser(token && stored ? stored : null);
    setIsReady(true);
  };

  useEffect(() => {
    refresh();

    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key || ["fgz_user", "fgz_token"].includes(e.key)) refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("fgz_token");
    localStorage.removeItem("fgz_user");
    setUser(null);
    window.location.href = "/login";
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem("fgz_token", token);
    localStorage.setItem("fgz_user", JSON.stringify(userData));
    setUser(userData);
  };

  return {
    user,
    isReady,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    isPremiumUser: user?.role === "ADMIN" || user?.subscription?.status === "active",
    logout,
    login,
    refresh,
  };
}