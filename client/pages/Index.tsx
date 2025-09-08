import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapView } from "@/components/app/MapView";
import { ReportFlow } from "@/components/app/ReportFlow";
import { IssueCard } from "@/components/app/IssueCard";
import { Onboarding } from "@/components/app/Onboarding";
import { LogoLoader } from "@/components/app/LogoLoader";
import type { Issue } from "@shared/api";
import { Reveal } from "@/components/app/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Megaphone, Users, LineChart } from "lucide-react";
import { safeFetchJson } from "@/lib/api";

export default function Index() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [dataReady, setDataReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const data = await safeFetchJson<{ issues: Issue[] }>("/api/issues", undefined, { issues: [] });
      setIssues((data?.issues || []) as Issue[]);
    } catch (e: any) {
      setError("Failed to load issues");
    } finally {
      setDataReady(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // If we just came from OTP verification, remove the flag so loader shows once
  useEffect(()=>{
    try{
      if (typeof window !== 'undefined' && sessionStorage.getItem('postLogin') === '1') {
        // don't remove immediately; let Index skip its loader (skipLoader reads it synchronously)
        // remove on next tick to keep behavior consistent
        setTimeout(()=>{ try{ sessionStorage.removeItem('postLogin'); }catch{} }, 0);
      }
    }catch{}
  },[]);

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

  const skipLoader = typeof window !== 'undefined' && sessionStorage.getItem('postLogin') === '1';
  const showLoader = !(dataReady && (minElapsed || skipLoader));
  if (showLoader) {
    return (
      <div className="min-h-[65vh] grid place-items-center">
        <LogoLoader size={340} />
      </div>
    );
  }


  useEffect(() => {
    try {
      sessionStorage.setItem('userpage_ready', '1');
      window.dispatchEvent(new Event('userpage_ready'));
    } catch {}
    return () => {
      try {
        sessionStorage.removeItem('userpage_ready');
        window.dispatchEvent(new Event('userpage_unready'));
      } catch {}
    };
  }, []);

  return (
    <div>
      <Onboarding />
      <section className="container grid items-center gap-8 py-10 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Empower citizens. Accelerate resolutions.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sahayak is a transparent, real-time platform for reporting civic issues and driving accountability.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <KpiLink to="/issues?view=ward" label="Open in your ward" value={openCount} />
            <KpiLink to="/issues?view=verified" label="Community verifications" value={issues.reduce((a, i) => a + i.upvotes, 0)} />
            <KpiLink to="/issues?view=categories" label="Categories" value={new Set(issues.map((i) => i.category)).size || 0} />
          </div>
        </div>
        <MapView />
      </section>

      <section id="report" className="-mt-[30px]" />

      {/* Our Mission */}
      <OurMission />

      {/* How it works */}
      <HowItWorks />

      {/* FAQ */}
      <Faq />

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}

function KpiLink({ to, label, value }: { to: string; label: string; value: number }) {
  return (
    <Link to={to} className="rounded-lg border p-3 transition-transform hover:-translate-y-0.5 hover:shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </Link>
  );
}

function Testimonials() {
  const quotes = [
    { q: "Reported a streetlight and it was fixed within days.", a: "Neha, Pune" },
    { q: "Our park cleanup got 50+ volunteers through the app!", a: "Aditya, Mumbai" },
    { q: "Finally a place where civic issues get attention.", a: "Riya, Delhi" },
    { q: "Loved seeing before/after success stories.", a: "Karan, Bengaluru" },
  ];

  return (
    <section className="border-t bg-muted/10 py-16">
      <div className="container">
        <h2 className="mb-6 text-center text-3xl font-bold">Live Testimonials</h2>
        <Carousel
          opts={{ align: "start", loop: true }}
          className="relative group"
          setApi={(api) => {
            // simple autoplay with pause on hover and when tab hidden
            const el = api.rootNode();
            let active = true;
            function onEnter() { active = false; }
            function onLeave() { active = true; }
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
            const id = window.setInterval(() => {
              if (document.hidden || !active) return;
              api.scrollNext();
            }, 3500);
            api.on("destroy", () => {
              window.clearInterval(id);
              el.removeEventListener("mouseenter", onEnter);
              el.removeEventListener("mouseleave", onLeave);
            });
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {quotes.map((t, i) => (
              <CarouselItem key={i} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="h-full">
                  <div className="rounded-lg border bg-card p-4 text-sm shadow-sm h-full">
                    <div className="break-words">“{t.q}”</div>
                    <div className="mt-2 text-xs text-muted-foreground">— {t.a}</div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
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

function OurMission() {
  return (
    <Reveal className="border-t bg-muted/20 py-16">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold">Empowering Citizens to Build a Better Community.</h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
          This app is more than a reporting tool—it's a platform for civic action. We believe that when citizens unite, they can drive real change in their neighborhoods. Sahaayak empowers you to report local issues, connect with others, and take part in community-led solutions.
        </p>
      </div>
    </Reveal>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Megaphone, title: "Report", text: "Use our easy form to report local problems like broken streetlights, overflowing trash, or unsafe roads." },
    { icon: Users, title: "Collaborate", text: "Your reports are added to the Community feed where others can see and discuss ways to fix them." },
    { icon: LineChart, title: "Impact", text: "Track your contributions and see how your involvement makes a tangible difference in your neighborhood." },
  ];
  return (
    <section className="container py-16">
      <h2 className="mb-6 text-center text-3xl font-bold">How It Works</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 160} direction="right" className="group rounded-lg border p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
            <s.icon className="mb-3 h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            <div className="text-xl font-semibold">{s.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    { q: "What kind of issues can I report?", a: "Anything affecting public spaces or safety: potholes, lights, waste, vandalism, water logging, and more." },
    { q: "How does the app verify my report?", a: "Community upvotes and comments help verify. Reports reaching thresholds are reviewed by moderators." },
    { q: "What happens after I report an issue?", a: "It appears in the feed, gathers validation, and progresses through statuses until resolved." },
    { q: "How can I contribute to the community?", a: "Verify reports, add helpful comments, share updates, and lead local clean-ups or fix drives." },
    { q: "Is my personal information public?", a: "Only the details you choose in Privacy settings. Email/phone are private by default." },
    { q: "Can I track my impact?", a: "Yes—see your activity in the Profile hub and the stats on each issue." },
  ];
  return (
    <Reveal className="border-t bg-muted/10 py-16">
      <div className="container">
        <h2 className="mb-6 text-center text-3xl font-bold">FAQ</h2>
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger>{it.q}</AccordionTrigger>
              <AccordionContent>{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Reveal>
  );
}
