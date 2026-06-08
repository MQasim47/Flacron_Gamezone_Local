"use client";

import { useEffect, useState } from "react";
import { getSubscription } from "../api/billing";
import { useAuth } from "./useAuth";
import type { SubscriptionInfo } from "../types";

export function useSubscription() {
  const { user, isAdmin } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    getSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false));
  }, [user]);

  return {
    subscription,
    loading,
    isPremium: isAdmin || subscription?.status === "active",
    status: subscription?.status ?? null,
  };
}