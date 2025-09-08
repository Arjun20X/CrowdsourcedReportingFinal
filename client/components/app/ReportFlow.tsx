import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CreateIssuePayload, Issue } from "@shared/api";
import piexif from "piexifjs";

function vibrate() {
  try { navigator.vibrate?.(30); } catch {}
}

function degToDmsRational(dec: number) {
  const deg = Math.floor(Math.abs(dec));
  const minFloat = (Math.abs(dec) - deg) * 60;
  const min = Math.floor(minFloat);
  const secFloat = (minFloat - min) * 60;
  const sec = Math.round(secFloat * 100);
  return [ [deg, 1], [min, 1], [sec, 100] ];
}

async function embedGpsExif(dataUrl: string, lat: number, lng: number) {
  try {
    const zeroth: any = {};
    const exif: any = {};
    const gps: any = {};
    const latRef = lat >= 0 ? "N" : "S";
    const lngRef = lng >= 0 ? "E" : "W";
    gps[piexif.GPSIFD.GPSLatitudeRef] = latRef;
    gps[piexif.GPSIFD.GPSLatitude] = degToDmsRational(lat);
    gps[piexif.GPSIFD.GPSLongitudeRef] = lngRef;
    gps[piexif.GPSIFD.GPSLongitude] = degToDmsRational(lng);
    const exifObj = { "0th": zeroth, Exif: exif, GPS: gps } as any;
    const exifBytes = piexif.dump(exifObj);
    const withExif = piexif.insert(exifBytes, dataUrl);
    return withExif as string;
  } catch {
    return dataUrl; // fallback
  }
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permError, setPermError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function requestPermissions() {
    setPermError(null);
    setLocating(true);
    const geoPromise = new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocation unavailable"));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });

    const camPromise = (async () => {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera unavailable");
      try { stopStream(); } catch {}
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: true });
      setStream(s);
      const v = videoRef.current;
      if (v) {
        v.srcObject = s as any;
        v.playsInline = true;
        await v.play().catch(() => {});
      }
      return s;
    })();

    try {
      const [geo] = await Promise.allSettled([geoPromise, camPromise]).then((results) => {
        const g = results[0];
        const c = results[1];
        if (g.status === "fulfilled") setCoords(g.value);
        if (c.status === "rejected") setPermError("Camera permission denied or unavailable");
        if (g.status === "rejected") setPermError((p) => p || "Location permission denied or unavailable");
        return [g.status === "fulfilled" ? g.value : null];
      });
      if (geo) setAddress("Current location");
    } finally {
      setLocating(false);
    }
  }

  function stopStream() {
    try { stream?.getTracks().forEach((t) => t.stop()); } catch {}
    setStream(null);
  }

  function start() {
    vibrate();
    setOpen(true);
    setStep(1);
    setTitle("");
    setDescription("");
    setCategory("pothole");
    setPhoto("");
    setCoords(null);
    setAddress("");
    requestPermissions();
  }

  useEffect(() => {
    if (!open) stopStream();
    return () => { stopStream(); };
  }, [open]);

  function handleVoice() {
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

  async function captureFromStream() {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current!;
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, w, h);
    const dataUrl = c.toDataURL("image/jpeg", 0.92);
    const tagged = coords ? await embedGpsExif(dataUrl, coords.lat, coords.lng) : dataUrl;
    setPhoto(tagged);
    vibrate();
    setStep(2);
  }

  async function onFilePicked(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const tagged = coords ? await embedGpsExif(dataUrl, coords.lat, coords.lng) : dataUrl;
      setPhoto(tagged);
      setStep(2);
      vibrate();
    };
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!coords) return;
    setSubmitting(true);
    const uid = JSON.parse(localStorage.getItem("uid") || '"anon"');
    const payload: CreateIssuePayload = {
      title: title || "Reported issue",
      description,
      category: category as any,
      location: coords,
      address: address || "Current location",
      wardId: "ward-1",
      photoBase64: photo,
      userId: typeof uid === "string" ? uid : "anon",
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

  return (
    <>
      <Button size="lg" className="fixed right-6 shadow-lg z-60" style={{ bottom: "calc(1.5rem + 40px + env(safe-area-inset-bottom))" }} onClick={start} aria-label="Report an Issue">
        📸 Report
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{step === 1 ? "Capture" : step === 2 ? "Describe" : "Confirm & Submit"}</DialogTitle>
          </DialogHeader>
          {step === 1 && (
            <div className="grid gap-4">
              {stream ? (
                <div className="relative">
                  <video ref={videoRef} className="w-full rounded-lg bg-black" muted playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : photo ? (
                <img src={photo} className="w-full rounded-lg" alt="Capture preview" />
              ) : (
                <div className="grid place-items-center rounded-lg border bg-muted p-6 text-muted-foreground">
                  {permError ? permError : "Camera readying..."}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {coords ? `Location: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : locating ? "Locating..." : "Location not available"}
              </div>
              <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex gap-2">
                  <Button onClick={captureFromStream} disabled={!stream || !coords}>Capture</Button>
                  <Button variant="outline" onClick={() => inputRef.current?.click()}>Upload</Button>
                </div>
                <Button onClick={() => setStep(2)} disabled={!photo}>Next</Button>
              </div>
              <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                onFilePicked(file);
              }} />
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
