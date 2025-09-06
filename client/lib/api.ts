export async function safeFetchJson<T = any>(path: string, opts?: RequestInit, fallback: T | null = null): Promise<T | null> {
  try {
    const res = await fetch(path, opts);
    if (!res.ok) {
      console.warn(`safeFetchJson: non-OK response for ${path}: ${res.status}`);
      return fallback;
    }
    const j = await res.json();
    return j as T;
  } catch (err) {
    console.warn(`safeFetchJson: fetch failed for ${path}`, err);
    return fallback;
  }
}
