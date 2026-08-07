import React, { useEffect, useState } from "react";
import { generateActivityItem } from "@/lib/activityFeed";
import { Zap, Activity } from "lucide-react";

export function LiveActivityTicker() {
  const [items, setItems] = useState([
    generateActivityItem(),
    generateActivityItem(),
    generateActivityItem(),
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => [generateActivityItem(), prev[0], prev[1]]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 px-4 shadow-xl flex items-center gap-3 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold shrink-0">
        <Activity className="w-3.5 h-3.5 animate-pulse text-amber-400" />
        <span>LIVE FEED</span>
      </div>

      <div className="flex-1 overflow-hidden relative h-6">
        <div className="absolute inset-0 flex items-center transition-all duration-500">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="font-bold text-amber-300">{items[0].name}</span>
            <span className="text-slate-400">{items[0].action}</span>
            <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              {items[0].time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
