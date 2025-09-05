import { useEffect, useMemo, useState } from "react";
import { MapView } from "@/components/app/MapView";
import { ReportFlow } from "@/components/app/ReportFlow";
import { IssueCard } from "@/components/app/IssueCard";
import { Onboarding } from "@/components/app/Onboarding";
import { LogoLoader } from "@/components/app/LogoLoader";
import type { Issue } from "@shared/api";

export default function Index() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/issues");
      const data = await res.json();
      setIssues(data.issues as Issue[]);
    } catch (e: any) {
      setError("Failed to load issues");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function vote(id: string, v: 1 | -1) {
    try {
      const res = await fetch(`/api/issues/${id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: "me", vote: v }) });
      const updated = (await res.json()) as Issue;
      setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch {}
  }

  async function comment(id: string, msg: string) {
    try {
      await fetch(`/api/issues/${id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: "me", userName: "You", message: msg }) });
      load();
    } catch {}
  }

  const openCount = useMemo(() => issues.filter((i) => i.status !== "resolved").length, [issues]);

  if (loading) {
    return (
      <div className="min-h-[65vh] grid place-items-center">
        <LogoLoader />
      </div>
    );
  }

  return (
    <div>
      <Onboarding />
      <section className="container grid items-center gap-8 py-10 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Empower citizens. Accelerate resolutions.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            CivicPulse is a transparent, real-time platform for reporting civic issues and driving accountability.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Kpi label="Open in your ward" value={openCount} />
            <Kpi label="Community verifications" value={issues.reduce((a, i) => a + i.upvotes, 0)} />
            <Kpi label="Categories" value={new Set(issues.map((i) => i.category)).size || 0} />
          </div>
        </div>
        <MapView />
      </section>

      <section id="report">
        <ReportFlow onCreated={(i) => setIssues((prev) => [i, ...prev])} />
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
