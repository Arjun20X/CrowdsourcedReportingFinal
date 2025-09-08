import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import type { Issue, StatsResponse } from "@shared/api";

const COLORS = ["#16a34a", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#06b6d4"];

export default function AdminDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [range, setRange] = useState<'d'|'w'|'m'|'y'>('m');

  useEffect(() => {
    fetch("/api/issues").then((r) => r.json()).then((d) => setIssues(d.issues || []));
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(()=>{});
  }, []);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of issues) map[i.status] = (map[i.status] || 0) + 1;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [issues]);

  const byDept = useMemo(() => {
    const map: Record<string, number> = {};
    for (const i of issues) map[i.wardId] = (map[i.wardId] || 0) + 1;
    return Object.entries(map).map(([dept, count]) => ({ dept, count }));
  }, [issues]);

  const recent = useMemo(() => issues.slice().sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)).slice(0, 8), [issues]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="inline-flex rounded-md border p-0.5 text-sm">
          {([
            {k:'d',l:'Daily'}, {k:'w',l:'Weekly'}, {k:'m',l:'Monthly'}, {k:'y',l:'Yearly'}
          ] as const).map((o, i)=> (
            <button key={o.k} onClick={()=>setRange(o.k)} className={`rounded px-2 py-1 ${range===o.k? 'bg-accent font-medium':''}`}>{o.l}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Issues Reported Today" value={stats?.issuesReportedToday ?? 0} />
        <StatCard label="Resolved This Month" value={stats?.resolvedThisMonth ?? 0} />
        <StatCard label="Avg. Resolution (hrs)" value={stats?.avgTimeToResolutionHours ?? 0} />
        <StatCard label="Active Issues" value={issues.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border p-4 lg:col-span-2">
          <div className="mb-3 text-sm font-medium">Issues by Department</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept}>
                <XAxis dataKey="dept" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mb-3 text-sm font-medium">Status Distribution</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {byStatus.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-3 text-sm font-medium">New Issues</div>
        <ul className="grid gap-2">
          {recent.map(i => (
            <li key={i.id} className="flex items-center gap-3 rounded-md border p-2">
              <img src={i.photoUrl} alt="thumb" className="h-12 w-12 rounded object-cover" />
              <div className="min-w-0">
                <div className="truncate font-medium">{i.title}</div>
                <div className="truncate text-xs text-muted-foreground">{i.address}</div>
              </div>
              <span className={`ml-auto rounded px-2 py-0.5 text-xs ${statusColor(i.status)}`}>{i.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function statusColor(s: Issue['status']){
  if (s==='resolved') return 'bg-emerald-100 text-emerald-700';
  if (s==='in_progress' || s==='under_review') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
