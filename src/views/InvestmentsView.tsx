import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DepositModal } from "@/components/ui/DepositModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, Sparkles, Check, Calculator, ShieldCheck, Zap, Bot, ArrowRight, Cpu, Activity, Gauge } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

interface BotPlan {
  type: string;
  min: number;
  max: number;
  monthlyPercent: number;
  durationDays: number;
  badge: string;
  popular?: boolean;
  latency: string;
  aiScore: string;
  colorScheme: "cyan" | "indigo" | "gold" | "emerald" | "amber";
  description: string;
}

export function InvestmentsView() {
  const { user, updateBalance, setCurrentTab } = useAuthStore();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(2); // Gold by default
  const [customAmount, setCustomAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const plans: BotPlan[] = [
    {
      type: "Bronze Starter Bot",
      min: 50,
      max: 249,
      monthlyPercent: 8.5,
      durationDays: 30,
      badge: "Beginner Bot",
      latency: "24ms Latency",
      aiScore: "96.2%",
      colorScheme: "cyan",
      description: "Low-frequency arbitrage trading bot ideal for testing daily yield execution.",
    },
    {
      type: "Silver Growth Bot",
      min: 250,
      max: 999,
      monthlyPercent: 10.5,
      durationDays: 30,
      badge: "Steady Bot",
      latency: "14ms Latency",
      aiScore: "97.8%",
      colorScheme: "indigo",
      description: "Multi-exchange orderbook engine producing continuous 24-hour yield compounding.",
    },
    {
      type: "Gold Prime Quant Bot",
      min: 1000,
      max: 4999,
      monthlyPercent: 13.5,
      durationDays: 30,
      badge: "Most Popular Bot",
      popular: true,
      latency: "4ms Latency",
      aiScore: "99.1%",
      colorScheme: "gold",
      description: "High-frequency triangular arbitrage engine optimized for maximum daily yield.",
    },
    {
      type: "Platinum VIP Bot",
      min: 5000,
      max: 19999,
      monthlyPercent: 16.0,
      durationDays: 30,
      badge: "Institutional Bot",
      latency: "2ms Latency",
      aiScore: "99.7%",
      colorScheme: "emerald",
      description: "Institutional HFT liquidity engine backed by Level 3 Insurance Aegis shield.",
    },
    {
      type: "Diamond Sovereign Bot",
      min: 20000,
      max: 100000,
      monthlyPercent: 18.5,
      durationDays: 30,
      badge: "Ultra Sovereign Bot",
      latency: "0.8ms Ultra HFT",
      aiScore: "99.9%",
      colorScheme: "amber",
      description: "Elite sovereign quant algorithm executing cross-chain MEV liquidity sweeps.",
    },
  ];

  const currentPlan = plans[selectedPlanIndex];

  // Calculate projected yield
  const effectiveAmount = Math.max(customAmount || 0, currentPlan.min);
  const totalProfit = (effectiveAmount * currentPlan.monthlyPercent) / 100;
  const dailyYield = totalProfit / currentPlan.durationDays;

  const fetchInvestments = async () => {
    try {
      const res = await fetch("/api/investments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("invest_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.investments) setActiveInvestments(data.investments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleStartInvestment = async () => {
    if ((user?.balance || 0) < effectiveAmount) {
      setShowDepositModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
        body: JSON.stringify({
          planType: currentPlan.type,
          amount: effectiveAmount,
          durationDays: currentPlan.durationDays,
          profitPercent: currentPlan.monthlyPercent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start investment");

      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      toast.success(`🤖 ${currentPlan.type} activated successfully! Daily yield started.`);
      updateBalance(data.newBalance);
      fetchInvestments();
    } catch (err: any) {
      toast.error(err.message || "Failed to start investment");
    } finally {
      setLoading(false);
    }
  };

  const renderBotGraphic = (scheme: string, popular?: boolean) => {
    return (
      <div className="relative h-28 w-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center p-3 overflow-hidden group-hover:border-slate-700 transition">
        {/* Radar Background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />

        {/* Central Glowing Bot Avatar */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl group-hover:scale-110 transition duration-300">
            <Bot className="w-7 h-7 text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider mt-1.5 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" /> QUANT 24/7 ACTIVE
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        requiredAmount={effectiveAmount}
        featureName={currentPlan.type}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-amber-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Bot className="w-7 h-7" />
            </div>
            <span>Institutional Quant Yield Bots</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-2xl">
            Select an automated AI quant algorithm to execute high-frequency arbitrage across crypto, forex, and commodities with guaranteed daily yield payouts.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Live Engine Status</p>
            <p className="text-xs font-black text-emerald-400">5 BOT ENGINES ONLINE</p>
          </div>
        </div>
      </div>

      {/* Plan Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {plans.map((plan, idx) => {
          const isSelected = selectedPlanIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedPlanIndex(idx);
                setCustomAmount(plan.min);
              }}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                isSelected
                  ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-2xl shadow-amber-500/20"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant={isSelected ? "gold" : "info"} className="text-[9px] shadow-lg">
                  {plan.badge}
                </Badge>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{plan.latency}</span>
              </div>

              {renderBotGraphic(plan.colorScheme, plan.popular)}

              <div>
                <h3 className="font-bold text-slate-100 text-xs">{plan.type}</h3>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  +{plan.monthlyPercent}% <span className="text-[10px] font-normal text-slate-400">/ mo</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight line-clamp-2">{plan.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-300 flex justify-between items-center">
                <span>Min: <strong className="text-amber-300">${plan.min.toLocaleString()}</strong></span>
                <span>Term: <strong className="text-white">{plan.durationDays}D</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Investment Calculator & Activation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-amber-500/30 bg-slate-900/90">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <CardTitle>Yield Return Calculator: {currentPlan.type}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Specify Investment Capital ($ USD)
              </label>
              <Input
                type="number"
                min={currentPlan.min}
                max={currentPlan.max}
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="text-lg font-bold text-amber-300"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Allowed capital range for {currentPlan.type}: ${currentPlan.min} to ${currentPlan.max}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Daily Return</span>
                <span className="text-lg font-bold text-emerald-400">{formatCurrency(dailyYield)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">30-Day Net Profit</span>
                <span className="text-lg font-bold text-emerald-400">{formatCurrency(totalProfit)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Payout</span>
                <span className="text-lg font-bold text-amber-300">
                  {formatCurrency(effectiveAmount + totalProfit)}
                </span>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              onClick={handleStartInvestment}
              disabled={loading}
              className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:brightness-110 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-slate-950" />
              <span>{loading ? "Activating Quant Bot..." : `Deploy ${currentPlan.type} ($${effectiveAmount})`}</span>
            </Button>
          </CardContent>
        </Card>

        {/* User Balance Info */}
        <Card className="border-slate-800 bg-slate-900/90 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg">Your Wallet Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Available Balance</span>
              <p className="text-3xl font-extrabold text-white">{formatCurrency(user?.balance || 0)}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4" /> Instant automated dividend distribution
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4" /> Capital principal returned at term maturity
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4" /> Auto-Renew option for continuous compounding
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentTab("wallet")}
              className="w-full text-xs cursor-pointer"
            >
              + Deposit More Funds
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Investments List */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Historical Quant Portfolios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase">
                <tr>
                  <th className="p-3">Plan Type</th>
                  <th className="p-3">Capital</th>
                  <th className="p-3">Monthly Return</th>
                  <th className="p-3">Yield Earned</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {activeInvestments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      No active quant portfolios yet. Deploy a bot above!
                    </td>
                  </tr>
                ) : (
                  activeInvestments.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-slate-100">{inv.planType}</td>
                      <td className="p-3 font-semibold text-slate-200">{formatCurrency(inv.amount)}</td>
                      <td className="p-3 font-bold text-emerald-400">+{inv.profitPercent}%</td>
                      <td className="p-3 font-bold text-amber-400">{formatCurrency(inv.profitEarned || 0)}</td>
                      <td className="p-3">
                        <Badge variant="success">{inv.status}</Badge>
                      </td>
                      <td className="p-3 text-slate-400">{formatDate(inv.startDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
