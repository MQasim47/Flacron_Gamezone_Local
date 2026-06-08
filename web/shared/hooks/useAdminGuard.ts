"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export function useAdminGuard() {
  const { isReady, isAuthenticated, isAdmin } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!isAdmin) {
      window.location.href = "/";
      return;
    }
    setChecked(true);
  }, [isReady, isAuthenticated, isAdmin]);

  return { isChecking: !checked };
}