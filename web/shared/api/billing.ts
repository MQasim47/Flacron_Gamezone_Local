import { apiGet, apiPost } from "./client";
import type { SubscriptionInfo } from "../types";

export const createCheckoutSession = (plan: "monthly" | "yearly") =>
  apiPost<{ url: string }>("/api/billing/checkout", { plan });

export const getSubscription = () =>
  apiGet<SubscriptionInfo>("/api/billing/subscription");

export const cancelSubscription = () =>
  apiPost<void>("/api/billing/cancel", {});

export const reactivateSubscription = () =>
  apiPost<void>("/api/billing/reactivate", {});

export const createPortalSession = () =>
  apiPost<{ url: string }>("/api/billing/portal", {});