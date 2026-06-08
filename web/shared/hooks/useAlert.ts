"use client";

import { useCallback, useState } from "react";
import type { AlertMessage } from "../types";

export function useAlert(autoDismissMs = 4000) {
  const [alert, setAlert] = useState<AlertMessage | null>(null);

  const show = useCallback( 
    (text: string, type: AlertMessage["type"] = "success") => {
      setAlert({ text, type });
      if (autoDismissMs > 0) {
        setTimeout(() => setAlert(null), autoDismissMs);
      }
    },
    [autoDismissMs]
  );

  const clear = useCallback(() => setAlert(null), []);

  return { alert, show, clear };
}