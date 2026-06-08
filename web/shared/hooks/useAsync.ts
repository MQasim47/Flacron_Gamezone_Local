import { useState, useCallback } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(fn: (...args: any[]) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });
      try {
        const data = await fn(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (err: any) {
        const error = err?.message ?? "Something went wrong";
        setState({ data: null, loading: false, error });
        throw err;
      }
    },
    [fn]
  );

  return { ...state, execute };
}