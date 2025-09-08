import { useEffect, useMemo, useState } from "react";
import type { Issue } from "@shared/api";
import { MapView } from "@/components/app/MapView";

export default function AdminIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [map, setMap] = useState(false);

  useEffect(() => {
    fetch("/api/issues").then(r=>r.json()).then(d=>setIssues(d.issues||[]));
  }, []);

  const filtered = useMemo(() => issues.filter(i =>
    (!dept || i.wardId===dept) && (!status || i.status===status) && (!q || i.title.toLowerCase().includes(q.toLowerCase()) || i.address.toLowerCase().includes(q.toLowerCase()))
  ), [issues, dept, status, q]);

  const depts = useMemo(()=>Array.from(new Set(issues.map(i=>i.wardId))),[issues]);
  const statuses = useMemo(()=>Array.from(new Set(issues.map(i=>i.status))),[issues]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Search title/address" value={q} onChange={e=>setQ(e.target.value)} className="rounded border px-3 py-2 text-sm" />
        <select value={dept} onChange={e=>setDept(e.target.value)} className="rounded border px-2 py-2 text-sm"><option value="">All Departments</option>{depts.map(d=>(<option key={d} value={d}>{d}</option>))}</select>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="rounded border px-2 py-2 text-sm"><option value="">All Statuses</option>{statuses.map(s=>(<option key={s} value={s}>{s}</option>))}</select>
        <button onClick={()=>setMap(m=>!m)} className="ml-auto rounded border px-3 py-2 text-sm">{map? 'Table View':'Map View'}</button>
      </div>

      {map ? (
        <div className="rounded border p-2">
          <MapView />
        </div>
      ) : (
        <div className="overflow-auto rounded border">
          <table className="min-w-[800px] w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Title</th>
                <th className="p-2">Department</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i=> (
                <tr key={i.id} className="border-t">
                  <td className="p-2">{i.id}</td>
                  <td className="p-2">
                    <div className="font-medium">{i.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[360px]">{i.address}</div>
                  </td>
                  <td className="p-2">{i.wardId}</td>
                  <td className="p-2"><span className={`rounded px-2 py-0.5 text-xs ${statusColor(i.status)}`}>{i.status}</span></td>
                  <td className="p-2">{new Date(i.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button className="rounded border px-2 py-1 text-xs">Assign</button>
                      <button className="rounded border px-2 py-1 text-xs">In-progress</button>
                      <button className="rounded border px-2 py-1 text-xs">Resolved</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusColor(s: Issue['status']){
  if (s==='resolved') return 'bg-emerald-100 text-emerald-700';
  if (s==='in_progress' || s==='under_review') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}
