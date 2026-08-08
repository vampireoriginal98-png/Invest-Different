import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  CheckCircle2,
  Gift,
  Clock,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Bot,
  Share2,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

interface TaskItem {
  id: string;
  day: number;
  title: string;
  category: string;
  description: string;
  rewardAmount: number;
  requiredCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
}

export function TasksView() {
  const { token, updateBalance, setCurrentTab, user } = useAuthStore();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [consecutiveDays, setConsecutiveDays] = useState<number>(user?.consecutiveDays || 1);
  const [accountAgeDays, setAccountAgeDays] = useState<number>(1);
  const [activePhase, setActivePhase] = useState<"ALL" | "PHASE1" | "PHASE2" | "PHASE3" | "PHASE4">("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        if (data.consecutiveDays) setConsecutiveDays(data.consecutiveDays);
        if (data.accountAgeDays) setAccountAgeDays(data.accountAgeDays);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaim = async (taskId: string) => {
    setLoadingId(taskId);
    try {
      const res = await fetch(`/api/tasks/claim/${taskId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");

      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      toast.success(`🎁 Claimed +$${data.reward}.00 cash reward credited directly to profile balance!`);
      if (data.newBalance !== undefined) {
        updateBalance(data.newBalance);
      }
      fetchTasks();
    } catch (err: any) {
      toast.error(err.message || "Failed to claim task");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activePhase === "PHASE1") return t.day >= 1 && t.day <= 7;
    if (activePhase === "PHASE2") return t.day >= 8 && t.day <= 15;
    if (activePhase === "PHASE3") return t.day >= 16 && t.day <= 22;
    if (activePhase === "PHASE4") return t.day >= 23 && t.day <= 30;
    return true;
  });

  const totalRewardsPotential = tasks.reduce((sum, t) => sum + t.rewardAmount, 0);
  const claimedRewardsTotal = tasks.filter((t) => t.claimed).reduce((sum, t) => sum + t.rewardAmount, 0);
  const completedUnclaimedCount = tasks.filter((t) => t.completed && !t.claimed).length;

  const getShortcutTab = (category: string) => {
    switch (category) {
      case "SECURITY":
        return "profile";
      case "DEPOSIT":
        return "wallet";
      case "TRADING":
        return "trade";
      case "BOT":
        return "investments";
      case "STOCK":
        return "stocks";
      case "INSURANCE":
        return "insurance";
      case "REFERRAL":
        return "referral";
      case "DAILY":
        return "spin";
      default:
        return "dashboard";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-amber-600/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-400 text-xs font-black mb-3">
              <Gift className="w-4 h-4 text-amber-500" />
              <span>30-DAY INVESTOR EARNING PROGRAM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              30-Day Activity & Reward Milestones
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1.5 leading-relaxed">
              Stay active and earn up to <strong>${totalRewardsPotential}.00 in cash bonuses</strong> across 30 days of daily tasks, trading activities, bot deployments, and security goals. All claimed cash rewards credit directly to your live profile balance!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-xl">
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/40 text-amber-400">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Cash Claimed</p>
              <p className="text-xl font-black text-emerald-400">${claimedRewardsTotal}.00 <span className="text-xs font-normal text-slate-500">/ ${totalRewardsPotential}.00</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Consecutive Daily Activity Tracker Banner */}
      <div className="bg-slate-900/90 border border-amber-600/50 p-6 rounded-3xl shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-600/50 text-amber-500">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Consecutive Daily Activity Tracker
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                  Streak Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Account Age: <strong className="text-slate-200">{accountAgeDays} Day(s)</strong> | Consecutive Streak: <strong className="text-amber-400">{consecutiveDays} Day(s) Active</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/50 px-3.5 py-2 rounded-2xl">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Note: Missing a day resets your streak back to Day 1!</span>
          </div>
        </div>

        {/* 15-Day Consecutive Progress Tracker */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            15-Day Milestone Consecutive Progress
          </span>
          <div className="grid grid-cols-5 sm:grid-cols-15 gap-1.5">
            {Array.from({ length: 15 }, (_, i) => i + 1).map((dayNum) => {
              const isActive = dayNum <= consecutiveDays;
              const isToday = dayNum === consecutiveDays;

              return (
                <div
                  key={dayNum}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                    isActive
                      ? "bg-amber-950/60 border-amber-600/60 text-amber-400 shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-600 opacity-60"
                  } ${isToday ? "ring-2 ring-amber-500 animate-pulse" : ""}`}
                >
                  <span className="text-[9px] font-mono font-bold uppercase">D{dayNum}</span>
                  {isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActivePhase("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePhase === "ALL"
                ? "bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/50"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            All 30 Days ({tasks.length} Tasks)
          </button>
          <button
            onClick={() => setActivePhase("PHASE1")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePhase === "PHASE1"
                ? "bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/50"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Days 1 - 7: Activation
          </button>
          <button
            onClick={() => setActivePhase("PHASE2")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePhase === "PHASE2"
                ? "bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/50"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Days 8 - 15: Trading & Bots
          </button>
          <button
            onClick={() => setActivePhase("PHASE3")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePhase === "PHASE3"
                ? "bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/50"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Days 16 - 22: Network & Growth
          </button>
          <button
            onClick={() => setActivePhase("PHASE4")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePhase === "PHASE4"
                ? "bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/50"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Days 23 - 30: Sovereign Apex
          </button>
        </div>

        {completedUnclaimedCount > 0 && (
          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-3 py-1.5 rounded-full animate-bounce">
            🎉 {completedUnclaimedCount} Ready to Claim!
          </span>
        )}
      </div>

      {/* 30-Day Task List */}
      <div className="space-y-3">
        {filteredTasks.map((tsk) => {
          const progressPercent = Math.min(100, Math.floor(((tsk.currentCount || 0) / tsk.requiredCount) * 100));

          return (
            <div
              key={tsk.id}
              className={`p-5 rounded-2xl border transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                tsk.claimed
                  ? "bg-slate-950/60 border-slate-800/80 opacity-75"
                  : tsk.completed
                  ? "bg-amber-950/20 border-amber-600/50 shadow-amber-950/30"
                  : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-950 text-amber-400 border border-amber-600/30">
                    DAY {tsk.day}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                    {tsk.category}
                  </span>
                  <h3 className="text-sm font-bold text-white">{tsk.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    +${tsk.rewardAmount}.00 Cash
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{tsk.description}</p>

                {/* Task Progress Bar */}
                {!tsk.claimed && (
                  <div className="pt-2 max-w-xs space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                      <span>Progress Status</span>
                      <span>{tsk.currentCount || 0} / {tsk.requiredCount} ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className="gold-gradient h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, progressPercent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {tsk.claimed ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 text-slate-400 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CLAIMED (+${tsk.rewardAmount})
                  </span>
                ) : tsk.completed ? (
                  <button
                    onClick={() => handleClaim(tsk.id)}
                    disabled={loadingId === tsk.id}
                    className="gold-gradient text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-xl shadow-amber-950/50 hover:brightness-110 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>{loadingId === tsk.id ? "Claiming..." : `CLAIM +$${tsk.rewardAmount}.00 TO BALANCE`}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentTab(getShortcutTab(tsk.category))}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 text-amber-400 border border-amber-600/30 hover:bg-amber-950/40 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Start Activity</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
