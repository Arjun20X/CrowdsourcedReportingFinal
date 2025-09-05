import { useEffect, useMemo, useState } from "react";

function bboxFromCenter(lat: number, lng: number, delta = 0.02) {
  const south = lat - delta;
  const north = lat + delta;
  const west = lng - delta;
  const east = lng + delta;
  return { south, west, north, east };
}

export function MapView() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setDenied(true),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const center = coords || { lat: 28.6139, lng: 77.2090 };
  const bbox = useMemo(() => bboxFromCenter(center.lat, center.lng, 0.02), [center]);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.west}%2C${bbox.south}%2C${bbox.east}%2C${bbox.north}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-muted">
      <div className="aspect-[16/9]">
        <iframe title="Map" aria-label="Map of nearby issues" className="h-full w-full" src={src} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
      {denied && (
        <div className="absolute left-4 top-4 rounded-md bg-background/90 p-2 text-sm text-muted-foreground">
          Location permission denied. Showing city view.
        </div>
      )}
    </div>
  );
}
