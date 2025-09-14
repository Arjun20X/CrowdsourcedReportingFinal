import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Stage = { key: string; label: string; icon: string; percent: number };

export const DEFAULT_STAGES: Stage[] = [
  { key: "reported", label: "Issue Reported", icon: "✅", percent: 10 },
  { key: "ward", label: "Forwarded to Ward Leader", icon: "📩", percent: 25 },
  { key: "mc", label: "Forwarded to Municipal Corporation", icon: "🏛️", percent: 40 },
  { key: "dept", label: "Reported to Concern Department", icon: "🏢", percent: 55 },
  { key: "deployed", label: "Things Deployed to Resolve", icon: "🛠️", percent: 70 },
  { key: "arrived", label: "Resources Reached Ward Leader", icon: "📦", percent: 85 },
  { key: "resolved", label: "Issue Resolved", icon: "🎉", percent: 100 },
];

export default function IssueProgressTracker({
  progress,
  stages = DEFAULT_STAGES,
}: {
  progress: number;
  stages?: Stage[];
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="w-full">
      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-in-out"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="relative mt-4">
        <div className="h-8 w-full relative">
          {stages.map((s) => {
            const left = `${s.percent}%`;
            const active = pct >= s.percent;
            return (
              <TooltipProvider key={s.key}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`absolute -top-4 flex cursor-default -translate-x-1/2 flex-col items-center justify-center text-center`}
                      style={{ left }}
                      title={`${s.label} — ${s.percent}%`}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 ${active ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-muted-foreground border-gray-200"}`}
                      >
                        <span className="text-sm leading-none">{s.icon}</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">{s.label} — {s.percent}%</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-7 gap-2 text-xs text-center">
          {stages.map((s) => (
            <div key={s.key} className="truncate">{s.label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
