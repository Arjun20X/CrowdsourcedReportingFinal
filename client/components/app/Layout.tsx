import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getDefaultLocale, t, type Locale } from "@/lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileManager } from "@/components/app/ProfileManager";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [locale, setLocale] = useLocalStorage<Locale>("locale", getDefaultLocale());
  const [hc, setHc] = useLocalStorage<boolean>("hc", false);
  const [uid, setUid] = useLocalStorage<string>("uid", `user-${Math.random().toString(36).slice(2, 8)}`);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (hc) root.classList.add("hc"); else root.classList.remove("hc");
  }, [hc]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">CP</span>
            <span>CivicPulse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Home</NavLink>
            <NavLink to="/issues" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Issues</NavLink>
            <NavLink to="/contributions" className={({ isActive }) => isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}>Community</NavLink>
          </nav>
          <div className="relative flex items-center gap-2" ref={menuRef}>
            <select aria-label={t(locale, 'language')} value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="h-9 rounded-md border bg-background px-2 text-sm">
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
            </select>
            <Button aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} variant="outline" title={uid}>
              {uid}
            </Button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-12 z-50 w-64 rounded-md border bg-background p-1 shadow-md">
                <button role="menuitem" className="w-full rounded px-3 py-2 text-left hover:bg-accent" onClick={() => { setProfileOpen(true); setMenuOpen(false); }}>Profile</button>
                <button role="menuitem" className="w-full rounded px-3 py-2 text-left hover:bg-accent" onClick={() => { navigate('/my-issues'); setMenuOpen(false); }}>Issues Reported</button>
                <button role="menuitem" className="w-full rounded px-3 py-2 text-left hover:bg-accent" onClick={() => { navigate('/my-resolved'); setMenuOpen(false); }}>Issues Resolved</button>
                <button role="menuitem" className="flex w-full items-center justify-between rounded px-3 py-2 hover:bg-accent" onClick={() => setHc(!hc)}>
                  <span>High Contrast</span>
                  <span className={`ml-2 rounded px-2 py-0.5 text-xs ${hc ? 'bg-emerald-600 text-white' : 'bg-muted text-foreground'}`}>{hc ? 'ON' : 'OFF'}</span>
                </button>
                <button role="menuitem" className="w-full rounded px-3 py-2 text-left text-destructive hover:bg-accent" onClick={() => { localStorage.clear(); window.location.reload(); }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <ProfileManager uid={uid} />
        </DialogContent>
      </Dialog>
      <footer className="mt-16 border-t bg-muted/30">
        <div className="container grid gap-8 py-10 md:grid-cols-3">
          <div>
            <div className="text-lg font-semibold">Empowering Citizens, Building Communities</div>
            <p className="mt-2 text-sm text-muted-foreground">Report issues, verify problems, and contribute to solutions.</p>
          </div>
          <nav className="grid gap-2 text-sm">
            <div className="font-semibold">Quick links</div>
            <a className="hover:text-foreground text-muted-foreground" href="/">Home</a>
            <a className="hover:text-foreground text-muted-foreground" href="/#report">Report an Issue</a>
            <a className="hover:text-foreground text-muted-foreground" href="/contributions">Community</a>
          </nav>
          <div className="grid gap-2">
            <div className="font-semibold">Connect</div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <a aria-label="Facebook" className="hover:text-foreground" href="https://facebook.com" target="_blank" rel="noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H7v-3h3.5V9.5A4.5 4.5 0 0 1 15 5h3v3h-3a1 1 0 0 0-1 1V12H18l-.5 3h-3v7A10 10 0 0 0 22 12"/></svg>
              </a>
              <a aria-label="X" className="hover:text-foreground" href="https://twitter.com" target="_blank" rel="noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h3.7l5.2 7 6-7H21l-7.4 8.7L21 21h-3.7l-5.6-7.5L5 21H3l8.5-9.9L3 3z"/></svg>
              </a>
              <a aria-label="Instagram" className="hover:text-foreground" href="https://instagram.com" target="_blank" rel="noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .4 1.5.9.5.5.7.9.9 1.5.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.4 1-.9 1.5-.5.5-.9.7-1.5.9-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.4-1.5-.9-.5-.5-.7-.9-.9-1.5-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.4-1 .9-1.5.5-.5.9-.7 1.5-.9.4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.2 0-3.5 0-4.7.1-1 .1-1.6.2-2 .3-.5.1-.8.3-1.1.6-.3.3-.5.6-.6 1.1-.1.4-.2 1-.3 2-.1 1.2-.1 1.5-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.3 2 .1.5.3.8.6 1.1.3.3.6.5 1.1.6.4.1 1 .2 2 .3 1.2.1 1.5.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 2-.3.5-.1.8-.3 1.1-.6.3-.3.5-.6.6-1.1.1-.4.2-1 .3-2 .1-1.2.1-1.5.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.3-2-.1-.5-.3-.8-.6-1.1-.3-.3-.6-.5-1.1-.6-.4-.1-1-.2-2-.3-1.2-.1-1.5-.1-4.7-.1zm0 3.2a6.8 6.8 0 1 1 0 13.6 6.8 6.8 0 0 1 0-13.6zm0 2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm6.4-2.9a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0z"/></svg>
              </a>
            </div>
            <a className="text-sm text-muted-foreground hover:text-foreground" href="mailto:support@civicpulse.app">support@civicpulse.app</a>
          </div>
        </div>
        <div className="border-t">
          <div className="container py-4 text-xs text-muted-foreground">© {new Date().getFullYear()} CivicPulse</div>
        </div>
      </footer>
    </div>
  );
}
