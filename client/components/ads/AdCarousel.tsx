import React, { useEffect, useRef, useState } from 'react';

export default function AdCarousel({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const items = Array.from({ length: 6 }).map((_, i) => ({ id: `ad-${i}`, title: 'Post Your Ad Here' }));
  const SLIDE_W = 450; // px
  const SLIDE_H = 250; // px

  const [slideWidth, setSlideWidth] = useState<string | number>(`${SLIDE_W}px`);

  useEffect(() => {
    function update() {
      if (typeof window === 'undefined') return;
      if (window.matchMedia('(min-width: 640px)').matches) setSlideWidth(`${SLIDE_W}px`);
      else setSlideWidth('100%');
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const start = () => {
    stop();
    intervalRef.current = window.setInterval(() => {
      try {
        if (document.hidden) return;
        if (hoverRef.current) return;
        const el = containerRef.current;
        if (!el) return;
        const first = el.querySelector('[data-slide]') as HTMLElement | null;
        const step = first ? Math.round(first.offsetWidth) : (typeof slideWidth === 'number' ? slideWidth : el.clientWidth);
        el.scrollBy({ left: step, behavior: 'smooth' });
        setTimeout(() => {
          if (!el) return;
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
            el.scrollLeft = 0;
          }
        }, 800);
      } catch {}
    }, 2500);
  };

  const stop = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    start();
    const onVis = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [slideWidth]);

  return (
    <div className={className || 'mx-auto md:ml-4'}>
      <div role="region" aria-roledescription="carousel" className="bg-white/40 p-2 rounded-md h-[250px]">
        <div
          ref={containerRef}
          onMouseEnter={() => { hoverRef.current = true; stop(); }}
          onMouseLeave={() => { hoverRef.current = false; start(); }}
          className="overflow-x-auto no-scrollbar -ml-2 md:-ml-4"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-stretch" style={{ gap: 8 }}>
            {items.map((it, i) => (
              <div key={it.id} data-slide role="group" aria-roledescription="slide" aria-label={`slide ${i + 1} of ${items.length}`} className="snap-start pl-2 md:pl-4 pr-2" style={{ minWidth: typeof slideWidth === 'number' ? `${slideWidth}px` : slideWidth }}>
                <div className="rounded-lg bg-card p-4 text-sm shadow-sm flex items-center justify-center" style={{ width: typeof slideWidth === 'number' ? slideWidth : '100%', height: SLIDE_H }}>
                  <span className="text-sm font-medium text-foreground">{it.title}</span>
                </div>
              </div>
            ))}

            {items.map((it) => (
              <div key={`dup-${it.id}`} className="snap-start pl-2 md:pl-4 pr-2" aria-hidden data-slide style={{ minWidth: typeof slideWidth === 'number' ? `${slideWidth}px` : slideWidth }}>
                <div className="rounded-lg bg-card p-4 text-sm shadow-sm flex items-center justify-center" style={{ width: typeof slideWidth === 'number' ? slideWidth : '100%', height: SLIDE_H }}>
                  <span className="text-sm font-medium text-foreground">{it.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
