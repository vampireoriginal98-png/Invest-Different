import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DepositModal } from "@/components/ui/DepositModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, Sparkles, Check, Calculator, ShieldCheck, Zap, Bot, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

export function InvestmentsView() {
  const { user, updateBalance, setCurrentTab } = useAuthStore();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(2); // Gold by default
  const [customAmount, setCustomAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const plans = [
    {
      type: "Bronze Starter Bot",
      min: 50,
      max: 249,
      monthlyPercent: 8.5,
      durationDays: 30,
      badge: "Beginner Bot",
      botImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      description: "Low-frequency arbitrage trading bot ideal for testing daily yield execution.",
    },
    {
      type: "Silver Growth Bot",
      min: 250,
      max: 999,
      monthlyPercent: 10.5,
      durationDays: 30,
      badge: "Steady Bot",
      botImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&auto=format&fit=crop&q=80",
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
      botImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&auto=format&fit=crop&q=80",
      description: "High-frequency triangular arbitrage engine optimized for maximum daily yield.",
    },
    {
      type: "Platinum VIP Bot",
      min: 5000,
      max: 19999,
      monthlyPercent: 16.0,
      durationDays: 30,
      badge: "Institutional Bot",
      botImage: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=200&auto=format&fit=crop&q=80",
      description: "Institutional HFT liquidity engine backed by Level 3 Insurance Aegis shield.",
    },
    {
      type: "Diamond Sovereign Bot",
      min: 20000,
      max: 100000,
      monthlyPercent: 18.5,
      durationDays: 30,
      badge: "Ultra Sovereign Bot",
      botImage: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=200&auto=format&fit=crop&q=80",
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        requiredAmount={effectiveAmount}
        featureName={currentPlan.type}
      />

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
          <Bot className="w-8 h-8 text-amber-400" />
          <span>Automated Quant Yield Bots</span>
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Deploy automated AI quant bots to generate continuous daily compounding yield.
        </p>
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
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                isSelected
                  ? "border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30 shadow-xl shadow-amber-500/10"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2">
                <img
                  src={plan.botImage}
                  alt={plan.type}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <Badge variant={isSelected ? "gold" : "info"} className="absolute top-2 left-2 text-[9px] shadow-lg">
                  {plan.badge}
                </Badge>
              </div>

              <div>
                <h3 className="font-bold text-slate-100 text-xs">{plan.type}</h3>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  +{plan.monthlyPercent}% <span className="text-[10px] font-normal text-slate-400">/ mo</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight line-clamp-2">{plan.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-300">
                <p>Min: <strong>${plan.min.toLocaleString()}</strong></p>
                <p>Period: <strong>{plan.durationDays} Days</strong></p>
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

            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
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
              className="w-full font-bold flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-slate-950" />
              <span>{loading ? "Activating..." : `Activate $${effectiveAmount} Portfolio`}</span>
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
              className="w-full text-xs"
            >
              + Deposit More Funds
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Investments List */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Past Investment Portfolios</CardTitle>
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
                      No active investments yet. Activate a plan above!
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
