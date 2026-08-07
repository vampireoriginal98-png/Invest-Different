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
import { ShieldAlert, Sparkles, TrendingUp, ArrowUpRight, Shield, Landmark, CandlestickChart, Dices, Gift, HelpCircle, GiftIcon } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

export function DashboardView() {
  const { user, setCurrentTab, setUser } = useAuthStore();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/wallet/balance", {
          headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
        });
        const data = await res.json();
        if (data.balance !== undefined) {
          setBalance(data.balance);
        }
      } catch (e) {
        console.error("Fetch balance error:", e);
      }
    };
    fetchBalance();
  }, []);

  const handleClaimDailyReward = async () => {
    setClaimingDaily(true);
    try {
      const res = await fetch("/api/rewards/claim-daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Live Activity Ticker */}
      <LiveActivityTicker />

      {/* Mandatory KYC Hover Alert Notification Banner */}
      <KYCHoverAlert />

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back, {user?.name || "Investor"} 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Overview of your active portfolio, bot yields, stock holdings, and trade orders
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleClaimDailyReward}
            disabled={claimingDaily}
            className="gold-gradient text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:brightness-110 transition cursor-pointer"
          >
            <GiftIcon className="w-4 h-4 text-slate-950" />
            <span>{claimingDaily ? "Claiming..." : "Claim $0.50 Daily Bonus"}</span>
          </button>
          <Button
            variant="outline"
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" /> Quick Guide
          </Button>
          <Button variant="gold" onClick={() => setCurrentTab("wallet")} className="flex items-center gap-1.5 text-xs cursor-pointer">
            <ArrowUpRight className="w-4 h-4" /> Deposit
          </Button>
          <Button variant="outline" onClick={() => setCurrentTab("withdrawals")} className="flex items-center gap-1.5 text-xs cursor-pointer">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Withdraw
          </Button>
          <Button variant="outline" onClick={() => setCurrentTab("investments")} className="flex items-center gap-1.5 text-xs cursor-pointer">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Bot Plans
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

      {/* Main Balance Card */}
      <BalanceCard balance={balance} />

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
            <h3 className="text-lg font-bold text-white">Automated Bot Dividends</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your active investment plans generate daily yields. Protect your capital with Level 1-4 Insurance Aegis shields.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setCurrentTab("insurance")}
            className="mt-6 w-full cursor-pointer"
          >
            View Insurance Aegis
          </Button>
        </Card>
      </div>
    </div>
  );
}
