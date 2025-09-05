import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CreateIssuePayload, Issue } from "@shared/api";

function vibrate() {
  try { navigator.vibrate?.(30); } catch {}
}

export function ReportFlow({ onCreated }: { onCreated: (i: Issue) => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photo, setPhoto] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("pothole");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
  }, []);

  function start() {
    setOpen(true); setStep(1); vibrate();
    setTitle(""); setDescription(""); setCategory("pothole"); setPhoto("");
  }

  function handleVoice() {
    // Simple SpeechRecognition usage when available
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setDescription((d) => (d ? d + " " : "") + text);
    };
    rec.start();
  }

  async function submit() {
    if (!coords) return;
    setSubmitting(true);
    const payload: CreateIssuePayload = {
      title: title || "Reported issue",
      description,
      category: category as any,
      location: coords,
      address: address || "Current location",
      wardId: "ward-1",
      photoBase64: photo,
    };
    try {
      const res = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Network");
      const issue = (await res.json()) as Issue;
      onCreated(issue);
      setOpen(false);
    } catch (e) {
      const q = JSON.parse(localStorage.getItem("offline-queue") || "[]");
      q.push({ type: "create-issue", payload });
      localStorage.setItem("offline-queue", JSON.stringify(q));
      alert("Offline: saved to queue, will retry later.");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function syncQueue() {
      const q = JSON.parse(localStorage.getItem("offline-queue") || "[]") as any[];
      if (!q.length) return;
      const rest = [] as any[];
      (async () => {
        for (const item of q) {
          if (item.type === "create-issue") {
            try {
              const res = await fetch("/api/issues", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item.payload) });
              if (!res.ok) throw new Error("Network");
            } catch { rest.push(item); }
          }
        }
        localStorage.setItem("offline-queue", JSON.stringify(rest));
      })();
    }
    window.addEventListener("online", syncQueue);
    return () => window.removeEventListener("online", syncQueue);
  }, []);

  return (
    <>
      <Button size="lg" className="fixed bottom-6 right-6 shadow-lg" onClick={start} aria-label="Report an Issue">
        📸 Report
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{step === 1 ? "Capture" : step === 2 ? "Describe" : "Confirm & Submit"}</DialogTitle>
          </DialogHeader>
          {step === 1 && (
            <div className="grid gap-4">
              {photo ? (
                <img src={photo} className="w-full rounded-lg" alt="Capture preview" />
              ) : (
                <div className="grid place-items-center rounded-lg border bg-muted p-6 text-muted-foreground">
                  Align the issue in the frame and capture.
                </div>
              )}
              <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPhoto(reader.result as string);
                reader.readAsDataURL(file);
                vibrate();
              }} />
              <div className="flex justify-between">
                <Button onClick={() => inputRef.current?.click()}>Open Camera</Button>
                <Button onClick={() => setStep(2)} disabled={!photo}>Next</Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border bg-background px-3 py-2" placeholder="Short title" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 rounded-md border bg-background px-3 py-2" placeholder="Describe the issue" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleVoice}>🎤 Voice to text</Button>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border bg-background px-3 py-2">
                  <option value="pothole">Pothole</option>
                  <option value="graffiti">Graffiti</option>
                  <option value="streetlight">Streetlight</option>
                  <option value="garbage">Garbage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-md border bg-background px-3 py-2" placeholder="Address (auto)" />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!description}>Next</Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-4">
              {photo && <img src={photo} alt="Preview" className="w-full rounded-lg" />}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Category</div><div className="font-medium capitalize">{category}</div>
                <div className="text-muted-foreground">Location</div><div className="font-medium">{coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Locating..."}</div>
                <div className="text-muted-foreground">Title</div><div className="font-medium">{title || "Reported issue"}</div>
                <div className="text-muted-foreground">Description</div><div className="font-medium">{description}</div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={submit} disabled={submitting || !coords}>{submitting ? "Submitting..." : "Submit"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
