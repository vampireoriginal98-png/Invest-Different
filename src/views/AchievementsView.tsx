import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { MASTER_ACHIEVEMENTS } from "@/lib/achievementEngine";
import { Award, Trophy, CheckCircle2, Lock } from "lucide-react";

export function AchievementsView() {
  const { token } = useAuthStore();
  const [unlockedCodes, setUnlockedCodes] = useState<string[]>([]);

  useEffect(() => {
    fetchUnlocked();
  }, [token]);

  const fetchUnlocked = async () => {
    try {
      const res = await fetch("/api/achievements/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUnlockedCodes(data.unlockedCodes || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <Trophy className="w-4 h-4" />
              <span>50+ MILESTONE BADGES</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Investor Achievements & Hall of Fame
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mt-1">
              Unlock prestigious badges as you trade, deposit, build referrals, and protect your capital.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MASTER_ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedCodes.includes(ach.code);

          return (
            <div
              key={ach.code}
              className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? "bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/50 shadow-xl shadow-amber-500/10"
                  : "bg-slate-900/60 border-slate-800/80 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl p-3 bg-slate-950 rounded-2xl border border-slate-800 inline-block">
                    {ach.badgeIcon}
                  </div>
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full">
                      <Lock className="w-3.5 h-3.5" /> LOCKED
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{ach.title}</h3>
                <p className="text-xs text-slate-400 mb-4">{ach.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">{ach.category}</span>
                <span className="font-bold text-amber-400">+${ach.rewardBonus} Reward Bonus</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
