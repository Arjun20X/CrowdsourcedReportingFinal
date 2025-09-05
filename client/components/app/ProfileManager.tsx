import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props { uid: string }

interface ProfileData { userId: string; username: string; email: string; phone: string }

export function ProfileManager({ uid }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData>({ userId: uid, username: uid, email: `${uid}@example.com`, phone: "" });

  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const debouncer = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/profile/${uid}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, [uid]);

  function onUsernameChange(v: string) {
    setProfile((p) => ({ ...p, username: v }));
    setNameAvailable(null);
    setErr(null);
    if (debouncer.current) window.clearTimeout(debouncer.current);
    setChecking(true);
    debouncer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/username-check`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: v }) });
        const data = await res.json();
        setNameAvailable(!!data.available);
      } catch { setNameAvailable(null); }
      finally { setChecking(false); }
    }, 400);
  }

  async function saveBasics() {
    setSaving(true); setMsg(null); setErr(null);
    try {
      const res = await fetch(`/api/profile/${uid}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: profile.username, email: profile.email, phone: profile.phone }) });
      if (!res.ok) {
        const j = await res.json().catch(()=>({error:'Error'}));
        throw new Error(j.error || 'Failed to update');
      }
      const data = await res.json();
      setProfile(data.profile);
      setMsg('Profile updated successfully');
    } catch (e: any) {
      setErr(e.message || 'Failed to update');
    } finally { setSaving(false); }
  }

  // Password form
  const [pwCur, setPwCur] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  async function changePassword() {
    setPwSaving(true); setPwMsg(null); setPwErr(null);
    try {
      const res = await fetch(`/api/profile/${uid}/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: pwCur, next: pwNew }) });
      if (!res.ok) {
        const j = await res.json().catch(()=>({error:'Error'}));
        throw new Error(j.error || 'Failed to change password');
      }
      setPwMsg('Password changed successfully');
      setPwCur(""); setPwNew("");
    } catch (e: any) {
      setPwErr(e.message || 'Failed to change password');
    } finally { setPwSaving(false); }
  }

  if (loading) {
    return <div className="rounded-md border p-4 text-sm text-muted-foreground">Loading profile…</div>;
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <h3 className="font-semibold">Account</h3>
        <div className="grid gap-2">
          <label className="text-sm text-muted-foreground">User ID</label>
          <div className="font-mono text-sm">{profile.userId}</div>
        </div>
        <div className="grid gap-1">
          <label className="text-sm">Username</label>
          <Input value={profile.username} onChange={(e)=>onUsernameChange(e.target.value)} placeholder="Choose a username" />
          <div className="text-xs h-4">
            {checking && <span className="text-muted-foreground">Checking availability…</span>}
            {!checking && nameAvailable === true && <span className="text-emerald-600">Available</span>}
            {!checking && nameAvailable === false && <span className="text-destructive">Already taken</span>}
          </div>
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm">Email</label>
            <Input type="email" value={profile.email} onChange={(e)=>setProfile((p)=>({ ...p, email: e.target.value }))} placeholder="you@example.com" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Phone</label>
            <Input type="tel" value={profile.phone} onChange={(e)=>setProfile((p)=>({ ...p, phone: e.target.value }))} placeholder="+1 555 0100" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={saveBasics} disabled={saving || nameAvailable === false}>Save changes</Button>
          {msg && <span className="text-sm text-emerald-600">{msg}</span>}
          {err && <span className="text-sm text-destructive">{err}</span>}
        </div>
      </section>

      <section className="grid gap-3 border-t pt-4">
        <h3 className="font-semibold">Change Password</h3>
        <div className="grid gap-1 sm:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm">Current password</label>
            <Input type="password" value={pwCur} onChange={(e)=>setPwCur(e.target.value)} placeholder="••••••" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">New password</label>
            <Input type="password" value={pwNew} onChange={(e)=>setPwNew(e.target.value)} placeholder="At least 6 characters" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={changePassword} disabled={pwSaving || pwCur.length===0 || pwNew.length < 6}>Update password</Button>
          {pwMsg && <span className="text-sm text-emerald-600">{pwMsg}</span>}
          {pwErr && <span className="text-sm text-destructive">{pwErr}</span>}
        </div>
      </section>
    </div>
  );
}
