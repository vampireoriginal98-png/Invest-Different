import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { InvestmentPreview } from "@/components/dashboard/InvestmentPreview";
import { ReferralTree } from "@/components/dashboard/ReferralTree";
import { LiveActivityTicker } from "@/components/dashboard/LiveActivityTicker";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { KYCHoverAlert } from "@/components/kyc/KYCHoverAlert";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ShieldAlert,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Landmark,
  CandlestickChart,
  Dices,
  Gift,
  HelpCircle,
  GiftIcon,
  Copy,
  Check,
  Zap,
  Clock,
  Layers,
  Activity,
  ArrowDownRight,
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

export function DashboardView() {
  const { user, setCurrentTab, setUser, token } = useAuthStore();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Active Investments State
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [editingGoal, setEditingGoal] = useState(false);
  const [targetGoalInput, setTargetGoalInput] = useState<number>(user?.targetInvestmentGoal || 10000);

  const targetGoal = user?.targetInvestmentGoal || 10000;

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const resBal = await fetch("/api/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataBal = await resBal.json();
      if (dataBal.balance !== undefined) {
        setBalance(dataBal.balance);
      }

      // Fetch active user bot investments
      const resInv = await fetch("/api/investments/my-investments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resInv.ok) {
        const dataInv = await resInv.json();
        setActiveInvestments(dataInv.investments || []);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  };

  const handleClaimDailyReward = async () => {
    setClaimingDaily(true);
    try {
      const res = await fetch("/api/rewards/claim-daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to claim daily reward");
        return;
      }
      confetti({ particleCount: 70, spread: 60 });
      toast.success("🎉 Daily +$0.50 reward claimed successfully!");
      if (data.user) {
        setUser(data.user);
        setBalance(data.user.balance);
      }
    } catch (e) {
      toast.error("Error claiming daily reward");
    } finally {
      setClaimingDaily(false);
    }
  };

  const handleCopyAccountId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("Account ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveTargetGoal = async () => {
    if (!targetGoalInput || targetGoalInput < 100) {
      toast.error("Minimum target goal is $100");
      return;
    }
    try {
      const res = await fetch("/api/user/target-goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetInvestmentGoal: targetGoalInput }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user) setUser(data.user);
        toast.success(`Target investment goal updated to $${targetGoalInput.toLocaleString()}`);
        setEditingGoal(false);
      } else {
        toast.error(data.error || "Failed to update target goal");
      }
    } catch (err) {
      toast.error("Error updating goal");
    }
  };

  // Calculations for goal and yield
  const totalActiveCapital = activeInvestments.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const totalYieldHarvested = activeInvestments.reduce((acc, inv) => acc + (inv.profitEarned || 0), 0);
  const totalAccumulated = balance + totalActiveCapital + totalYieldHarvested;
  const progressPercent = Math.min(100, Math.max(0, Number(((totalAccumulated / targetGoal) * 100).toFixed(1))));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Live Activity Ticker */}
      <LiveActivityTicker />

      {/* KYC Alert Notification Banner */}
      <KYCHoverAlert />

      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name || "Investor"} 👋
            </h1>
            {user?.id && (
              <button
                onClick={handleCopyAccountId}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
                title="Click to copy your unique Account ID"
              >
                <span>ID: {user.id}</span>
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            )}
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time control center for wallet balances, active yield plans, trading market charts, and investment performance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleClaimDailyReward}
            disabled={claimingDaily}
            className="gold-gradient text-slate-950 font-black px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:brightness-110 transition cursor-pointer"
          >
            <GiftIcon className="w-4 h-4 text-slate-950" />
            <span>{claimingDaily ? "Claiming..." : "Claim $0.50 Daily Bonus"}</span>
          </button>
          <Button
            variant="outline"
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" /> Guide
          </Button>
          <Button variant="gold" onClick={() => setCurrentTab("wallet")} className="flex items-center gap-1.5 text-xs cursor-pointer font-bold">
            <ArrowUpRight className="w-4 h-4" /> Deposit
          </Button>
          <Button variant="outline" onClick={() => setCurrentTab("withdrawals")} className="flex items-center gap-1.5 text-xs cursor-pointer font-bold">
            <ArrowDownRight className="w-4 h-4 text-emerald-400" /> Withdraw
          </Button>
        </div>
      </div>

      {/* Onboarding Guide Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onNavigateTab={(t) => {
          setShowOnboarding(false);
          setCurrentTab(t);
        }}
      />

      {/* Main Balance Card */}
      <BalanceCard balance={balance} />

      {/* Target Investment Portfolio Progress Tracker */}
      <div className="bg-slate-900/90 border border-amber-600/50 p-6 rounded-3xl shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-600/50 text-amber-400 shadow-xl">
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Target Portfolio Goal Milestone
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                  {progressPercent >= 100 ? "🎯 GOAL REACHED!" : `${progressPercent}% COMPLETED`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Target: <strong className="text-amber-400">${targetGoal.toLocaleString()}</strong> | Total Accumulated Value: <strong className="text-emerald-400">${totalAccumulated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditingGoal(!editingGoal)}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-600/40 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
          >
            {editingGoal ? "Cancel Edit" : "🎯 Edit Goal Target"}
          </button>
        </div>

        {editingGoal && (
          <div className="p-4 bg-slate-950 border border-amber-600/40 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase">
              Set Custom Target Portfolio Goal ($ USD)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="100"
                step="500"
                value={targetGoalInput}
                onChange={(e) => setTargetGoalInput(Number(e.target.value))}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                placeholder="10000"
              />
              <button
                onClick={handleSaveTargetGoal}
                className="px-5 py-2 gold-gradient text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Progress: <strong className="text-amber-400">${totalAccumulated.toFixed(2)}</strong></span>
            <span className="text-emerald-400 font-bold">{progressPercent}%</span>
            <span className="text-slate-400">Target: <strong className="text-white">${targetGoal.toLocaleString()}</strong></span>
          </div>

          <div className="h-3.5 w-full bg-slate-950 rounded-full border border-slate-800 p-0.5 overflow-hidden relative shadow-inner">
            <div
              className="h-full gold-gradient rounded-full transition-all duration-700 relative overflow-hidden shadow-lg"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Algorithmic Yield Engines Tracker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Active Yield Investment Plans ({activeInvestments.length})
            </h3>
          </div>
          <button
            onClick={() => setCurrentTab("investments")}
            className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            + Activate New Plan <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <p>No active Yield Investment plans currently running on your account.</p>
            <button
              onClick={() => setCurrentTab("investments")}
              className="gold-gradient px-4 py-2 rounded-xl text-slate-950 font-black text-xs uppercase cursor-pointer"
            >
              Activate Algorithmic Yield Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInvestments.map((inv) => {
              const daysPassed = Math.floor((Date.now() - new Date(inv.startDate || inv.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              const totalDays = inv.durationDays || 30;
              const daysLeft = Math.max(0, totalDays - daysPassed);
              const progressRatio = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{inv.planName || inv.botTierName || "Algorithmic Yield Engine"}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">Capital: <strong className="text-amber-400">${inv.amount}</strong></p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      RUNNING & YIELDING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Daily Yield Rate</span>
                      <strong className="text-emerald-400">+{inv.dailyRate}% / Day</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Expiration Days Left</span>
                      <strong className="text-amber-300">{daysLeft} Days Remaining</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Progress: Day {daysPassed} of {totalDays}</span>
                      <span>{progressRatio.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressRatio}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setCurrentTab("stocks")}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition flex flex-col items-center gap-1.5 text-center cursor-pointer"
        >
          <Landmark className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-bold text-white">Stock Portfolios</span>
        </button>

        <button
          onClick={() => setCurrentTab("broker")}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex flex-col items-center gap-1.5 text-center cursor-pointer"
        >
          <CandlestickChart className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-white">Trade Market</span>
        </button>

        <button
          onClick={() => setCurrentTab("insurance")}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition flex flex-col items-center gap-1.5 text-center cursor-pointer"
        >
          <Shield className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white">Insurance Shield</span>
        </button>

        <button
          onClick={() => setCurrentTab("spin")}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition flex flex-col items-center gap-1.5 text-center cursor-pointer"
        >
          <Dices className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white">1 Free Daily Spin</span>
        </button>

        <button
          onClick={() => setCurrentTab("tasks")}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col items-center gap-1.5 text-center cursor-pointer"
        >
          <Gift className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-white">Daily Tasks</span>
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvestmentPreview />
        <ActivityFeed />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReferralTree />
        </div>
        <Card className="flex flex-col justify-between border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/20">
          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 w-fit text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Algorithmic Yield Dividends</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your active investment plans generate daily yields. Protect your capital with Level 1-4 Insurance Aegis shields.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setCurrentTab("insurance")}
            className="mt-6 w-full cursor-pointer font-bold"
          >
            View Insurance Aegis
          </Button>
        </Card>
      </div>
    </div>
  );
}
