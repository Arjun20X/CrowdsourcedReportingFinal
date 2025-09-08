export async function safeFetchJson<T = any>(path: string, opts?: RequestInit, fallback: T | null = null): Promise<T | null> {
  // First attempt: relative fetch
  try {
    const res = await fetch(path, opts);
    if (!res.ok) {
      console.warn(`safeFetchJson: non-OK response for ${path}: ${res.status}`);
      return fallback;
    }
    const j = await res.json();
    return j as T;
  } catch (err) {
    console.warn(`safeFetchJson: relative fetch failed for ${path}`, err);
    // If running in a browser, try absolute origin as a fallback (helps proxy/preview environments)
    try {
      if (typeof window !== 'undefined' && path.startsWith('/')) {
        const url = `${window.location.origin}${path}`;
        const res2 = await fetch(url, opts);
        if (!res2.ok) {
          console.warn(`safeFetchJson: absolute fetch non-OK for ${url}: ${res2.status}`);
          return fallback;
        }
        const j2 = await res2.json();
        return j2 as T;
      }
    } catch (err2) {
      console.warn(`safeFetchJson: absolute fetch failed for ${path}`, err2);
    }
    return fallback;
  }
}
