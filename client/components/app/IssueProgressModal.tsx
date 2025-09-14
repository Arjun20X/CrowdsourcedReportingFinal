import React from "react";
import { DEFAULT_STAGES } from "@/components/app/IssueProgressTracker";

export default function IssueProgressModal({ progress, stages = DEFAULT_STAGES }: { progress: number; stages?: { key: string; label: string; icon?: string; percent: number }[] }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <div className="relative">
            {/* Vertical center line (base) */}
            <div className="absolute left-1/2 top-0 h-full -translate-x-1/2">
              <div className="w-1 bg-muted h-full rounded" />
            </div>
            {/* Filled portion */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2">
              <div
                className="w-1 rounded"
                style={{ height: `${pct}%`, background: 'linear-gradient(to bottom, #10b981, #059669)' , transition: 'height 500ms ease-in-out' }}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {stages.map((s, idx) => {
                const leftSide = idx % 2 === 0;
                const active = pct >= s.percent;
                return (
                  <div key={s.key} className="relative flex w-full">
                    {/* Content column */}
                    <div className={`w-1/2 px-4 ${leftSide ? "text-right" : "text-left"} hidden md:block`}>
                      {leftSide ? (
                        <div className={`${active ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{s.label}</div>
                      ) : null}
                    </div>

                    {/* Center marker + connector */}
                    <div className="w-0 flex-shrink-0 flex-grow-0 px-2 flex items-center justify-center">
                      <div className={`relative z-10 flex h-4 w-4 items-center justify-center rounded-full border ${active ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-gray-200'}`}>
                        <span className="sr-only">{s.percent}%</span>
                      </div>
                    </div>

                    <div className={`w-1/2 px-4 ${!leftSide ? "text-left" : "text-right"} hidden md:block`}>
                      {!leftSide ? (
                        <div className={`${active ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{s.label}</div>
                      ) : null}
                    </div>

                    {/* Mobile stacked view */}
                    <div className="md:hidden w-full px-2">
                      <div className={`${active ? 'text-foreground font-semibold' : 'text-muted-foreground'} text-sm`}>{s.label} <span className="text-xs text-muted-foreground">— {s.percent}%</span></div>
                    </div>

                    {/* Connector fill behind markers to show progress visually */}
                    <div
                      aria-hidden
                      className="absolute left-1/2 top-0 h-full -translate-x-1/2"
                      style={{
                        // small vertical gradient to indicate progress along the center line
                        background: 'transparent',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
