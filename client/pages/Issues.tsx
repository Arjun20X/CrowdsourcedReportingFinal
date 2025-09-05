import { useEffect, useMemo, useState } from "react";
import type { Issue } from "@shared/api";
import { IssueCard } from "@/components/app/IssueCard";

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uid = (typeof localStorage !== 'undefined' && localStorage.getItem('uid')) || `user-${Math.random().toString(36).slice(2,8)}`;

  async function load() {
    try {
      setError(null);
      const res = await fetch('/api/issues');
      const data = await res.json();
      setIssues((data.issues || []) as Issue[]);
    } catch (e) {
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  async function vote(id: string, v: 1 | -1) {
    try {
      // optimistic update
      setIssues((prev) => prev.map((i) => i.id === id ? { ...i, upvotes: (i.upvotes || 0) + (v === 1 ? 1 : 0), downvotes: (i.downvotes || 0) + (v === -1 ? 1 : 0) } : i));
      await fetch(`/api/issues/${id}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid, vote: v }) });
      load();
    } catch {}
  }

  return (
    <div className="container py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Issues</h1>
        <p className="text-sm text-muted-foreground">Help verify: Is this issue valid?</p>
      </div>
      {loading ? (
        <div className="rounded-md border p-4">Loading…</div>
      ) : error ? (
        <div className="rounded-md border border-destructive p-4 text-destructive">{error}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((i) => (
            <IssueCard key={i.id} issue={i} onVote={vote} onComment={() => {}} />
          ))}
          {issues.length === 0 && (
            <div className="col-span-full rounded-md border p-6 text-center text-muted-foreground">No issues to verify right now.</div>
          )}
        </div>
      )}
    </div>
  );
}
