import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';

/** Small data hook: loading / error / refresh for a GET endpoint. Pass null to skip. */
export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [refreshing, setRefreshing] = useState(false);
  const alive = useRef(true);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!path) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      try {
        const res = await api<T>(path);
        if (alive.current) {
          setData(res);
          setError(null);
        }
      } catch (e: any) {
        if (alive.current) setError(e?.message || 'Could not load');
      } finally {
        if (alive.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [path],
  );

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  return { data, error, loading, refreshing, reload: () => load(false), refresh: () => load(true), setData };
}
