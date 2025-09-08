export async function safeFetchJson<T = any>(path: string, opts?: RequestInit, fallback: T | null = null): Promise<T | null> {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return fallback;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    const baseOpts: RequestInit = { cache: 'no-store', credentials: 'same-origin', ...opts, signal: controller.signal } as RequestInit;
    try {
      const res = await fetch(path, baseOpts);
      clearTimeout(id);
      if (!res.ok) return fallback;
      return (await res.json()) as T;
    } catch (_) {
      clearTimeout(id);
    }

    if (typeof window !== 'undefined' && path.startsWith('/')) {
      const url = `${window.location.origin}${path}`;
      try {
        const res2 = await fetch(url, { cache: 'no-store', credentials: 'same-origin', ...opts });
        if (res2.ok) return (await res2.json()) as T;
      } catch {}

      if (path.startsWith('/api/')) {
        const nfRel = path.replace('/api/', '/.netlify/functions/api/');
        try {
          const r3 = await fetch(nfRel, { cache: 'no-store', credentials: 'same-origin', ...opts });
          if (r3.ok) return (await r3.json()) as T;
        } catch {}
        try {
          const r4 = await fetch(`${window.location.origin}${nfRel}`, { cache: 'no-store', credentials: 'same-origin', ...opts });
          if (r4.ok) return (await r4.json()) as T;
        } catch {}
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
}
