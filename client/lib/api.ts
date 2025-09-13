export async function safeFetchJson<T = any>(path: string, opts?: RequestInit, fallback: T | null = null): Promise<T | null> {
  try {
    // If offline or navigator explicitly reports offline, short-circuit
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return fallback;

    // If fetch isn't available for some reason, bail out
    if (typeof globalThis.fetch !== 'function') return fallback;

    // Build request options
    const baseOptsNoSignal: RequestInit = { cache: 'no-store', credentials: 'same-origin', ...opts } as RequestInit;

    // Helper to safely perform fetch and return parsed JSON or null
    async function tryFetch(url: string): Promise<T | null> {
      try {
        const controller = new AbortController();
        const signal = controller.signal;
        // Start fetch and ensure failures are caught
        const p = (async () => {
          try {
            const res = await globalThis.fetch(url, { ...baseOptsNoSignal, signal } as RequestInit);
            if (!res || !res.ok) return null;
            return (await res.json()) as T;
          } catch (e) {
            return null;
          }
        })();

        // Timeout after 8s — if timeout wins, we ignore fetch result
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
        const result = (await Promise.race([p, timeout])) as T | null;
        // If timeout resolved first, try to abort the fetch (best-effort)
        if (result === null) {
          try { controller.abort(); } catch {}
        }
        return result;
      } catch {
        return null;
      }
    }

    // If in browser and path is a root-relative url, try a few variants to avoid cross-origin failures
    if (typeof window !== 'undefined' && path.startsWith('/')) {
      try {
        const relResult = await tryFetch(path);
        if (relResult !== null) return relResult;
      } catch {}

      try {
        const absolute = `${window.location.origin}${path}`;
        const absResult = await tryFetch(absolute);
        if (absResult !== null) return absResult;
      } catch {}

      // Netlify function proxy pattern
      if (path.startsWith('/api/')) {
        try {
          const nfRel = path.replace('/api/', '/.netlify/functions/api/');
          const nfResult = await tryFetch(nfRel);
          if (nfResult !== null) return nfResult;
        } catch {}
        try {
          const nfAbsolute = `${window.location.origin}${path.replace('/api/', '/.netlify/functions/api/')}`;
          const nfAbsResult = await tryFetch(nfAbsolute);
          if (nfAbsResult !== null) return nfAbsResult;
        } catch {}
      }

      return fallback;
    }

    // Otherwise try direct fetch
    try {
      const direct = await tryFetch(path);
      if (direct !== null) return direct;
    } catch {}

    return fallback;
  } catch {
    return fallback;
  }
}
