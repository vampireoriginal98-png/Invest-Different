import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DepositModal } from "@/components/ui/DepositModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, Sparkles, Check, Calculator, ShieldCheck, Zap, Bot, ArrowRight, Cpu, Activity, Gauge, Lock, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { QUANT_BOT_CATALOG, QuantBotTier } from "@/data/botCatalog";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

export function InvestmentsView() {
  const { user, updateBalance, setCurrentTab } = useAuthStore();
  const [selectedBotId, setSelectedBotId] = useState<string>(QUANT_BOT_CATALOG[3].id); // Silver/Gold default
  const [customAmount, setCustomAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [harvestingId, setHarvestingId] = useState<string | null>(null);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "STARTER" | "HIGH_YIELD" | "VIP" | "SOVEREIGN">("ALL");

  const currentPlan: QuantBotTier = QUANT_BOT_CATALOG.find((b) => b.id === selectedBotId) || QUANT_BOT_CATALOG[3];

  const filteredBots = QUANT_BOT_CATALOG.filter((b) => {
    if (categoryFilter === "STARTER") return b.tierNumber <= 3;
    if (categoryFilter === "HIGH_YIELD") return b.tierNumber >= 4 && b.tierNumber <= 7;
    if (categoryFilter === "VIP") return b.tierNumber >= 8 && b.tierNumber <= 11;
    if (categoryFilter === "SOVEREIGN") return b.tierNumber >= 12;
    return true;
  });

  // Calculate projected yields for the calculator
  const effectiveAmount = Math.max(customAmount || 0, currentPlan.min);
  const totalProfit = (effectiveAmount * currentPlan.monthlyPercent) / 100;
  const dailyYield = totalProfit / currentPlan.durationDays;
  const hourlyYield = totalProfit / (currentPlan.durationDays * 24);

  // Concurrency capacity calculations
  const activeCount = activeInvestments.length;
  const maxSlotsAllowed = currentPlan.maxConcurrentAllowed;
  const remainingSlots = Math.max(0, maxSlotsAllowed - activeCount);

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
      toast.success(`🤖 ${currentPlan.type} activated! 30-day quantitative yield loop is live.`);
      updateBalance(data.newBalance);
      fetchInvestments();
    } catch (err: any) {
      toast.error(err.message || "Failed to start investment");
    } finally {
      setLoading(false);
    }
  };

  const handleHarvestYield = async (invId: string) => {
    setHarvestingId(invId);
    try {
      const res = await fetch(`/api/investments/claim-yield/${invId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("invest_token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to harvest yield");

      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      toast.success(`🌾 Harvested +$${data.harvestedAmount.toFixed(2)} yield directly into profile balance!`);
      updateBalance(data.newBalance);
      fetchInvestments();
    } catch (err: any) {
      toast.error(err.message || "No claimable yield available right now.");
    } finally {
      setHarvestingId(null);
    }
  };

  const renderBotGraphic = (scheme: string, popular?: boolean) => {
    return (
      <div className="relative h-28 w-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center p-3 overflow-hidden group-hover:border-slate-700 transition">
        {/* Radar Background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />

        {/* Central Glowing Bot Avatar */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-900 border border-amber-600/40 shadow-xl group-hover:scale-110 transition duration-300">
            <Bot className="w-7 h-7 text-amber-500" />
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        requiredAmount={effectiveAmount}
        featureName={currentPlan.type}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-amber-600/40 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-600/50 text-amber-500">
              <Bot className="w-7 h-7" />
            </div>
            <span>30-Day Quantitative Yield Bot Hub</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-2xl">
            Deploy automated high-frequency arbitrage bots for a <strong>30-day (720-hour) continuous execution cycle</strong>. Yields accumulate hourly and can be harvested straight into your profile balance at any moment.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">30-Day Execution Engine</p>
            <p className="text-xs font-black text-emerald-400">720 HOURS CONTINUOUS RUN</p>
          </div>
        </div>
      </div>

      {/* Tier Category Filters & Concurrency Indicator */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === "ALL"
                  ? "bg-amber-600 text-slate-950 font-black shadow-lg"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              All 15 Quant Bots
            </button>
            <button
              onClick={() => setCategoryFilter("STARTER")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === "STARTER"
                  ? "bg-amber-600 text-slate-950 font-black shadow-lg"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              Starter Tiers (1 - 3)
            </button>
            <button
              onClick={() => setCategoryFilter("HIGH_YIELD")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === "HIGH_YIELD"
                  ? "bg-amber-600 text-slate-950 font-black shadow-lg"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              High-Yield Quant (4 - 7)
            </button>
            <button
              onClick={() => setCategoryFilter("VIP")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === "VIP"
                  ? "bg-amber-600 text-slate-950 font-black shadow-lg"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              VIP Institutional (8 - 11)
            </button>
            <button
              onClick={() => setCategoryFilter("SOVEREIGN")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === "SOVEREIGN"
                  ? "bg-amber-600 text-slate-950 font-black shadow-lg"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              Sovereign Apex (12 - 15)
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>Bot Capacity: {activeCount} / {currentPlan.maxConcurrentAllowed} Active Slots</span>
            {remainingSlots > 0 && (
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/30">
                + You can rent {remainingSlots} more!
              </span>
            )}
          </div>
        </div>

        {/* Plan Selection Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredBots.map((plan) => {
            const isSelected = selectedBotId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedBotId(plan.id);
                  setCustomAmount(plan.min);
                }}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                  isSelected
                    ? "border-amber-600 bg-amber-950/40 ring-2 ring-amber-600/30 shadow-2xl shadow-amber-950/50"
                    : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <Badge variant={isSelected ? "gold" : "info"} className="text-[8px] px-2 py-0.5 shadow-lg">
                    T{plan.tierNumber} • {plan.badge}
                  </Badge>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">{plan.latency}</span>
                </div>

                {renderBotGraphic(plan.colorScheme, plan.popular)}

                <div>
                  <h3 className="font-bold text-slate-100 text-xs truncate">{plan.type}</h3>
                  <div className="text-lg font-black text-emerald-400 mt-1">
                    +{plan.monthlyPercent}% <span className="text-[9px] font-normal text-slate-400">/ 30D</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">{plan.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-300 flex justify-between items-center">
                  <span>Min: <strong className="text-amber-400">${plan.min.toLocaleString()}</strong></span>
                  <span className="text-[9px] text-slate-400 font-medium">Slots: <strong className="text-white">{plan.maxConcurrentAllowed}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment Calculator & Detailed Return Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-amber-600/40 bg-slate-900/90 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-500" />
              <CardTitle>Detailed 30-Day Bot Yield Breakdown: {currentPlan.type}</CardTitle>
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
                className="text-lg font-bold text-amber-400 bg-slate-950 border-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Capital range for {currentPlan.type}: ${currentPlan.min.toLocaleString()} to ${currentPlan.max.toLocaleString()}
              </p>
            </div>

            {/* Comprehensive Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Run Duration</span>
                <span className="text-sm font-black text-white">30 Days (720 hrs)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hourly Credit</span>
                <span className="text-sm font-black text-emerald-400">{formatCurrency(hourlyYield)} / hr</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Daily Yield Rate</span>
                <span className="text-sm font-black text-emerald-400">{formatCurrency(dailyYield)} / day</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-600/30">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">30-Day Total Return</span>
                <span className="text-sm font-black text-amber-400">
                  {formatCurrency(effectiveAmount + totalProfit)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-600/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Guaranteed Execution:</strong> 100% of principal capital (${effectiveAmount.toLocaleString()}) is automatically unlocked & refunded at 30-day maturity, while yields accumulate hourly!
              </span>
            </div>

            <Button
              variant="gold"
              size="lg"
              onClick={handleStartInvestment}
              disabled={loading}
              className="w-full gold-gradient font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-950/40 hover:brightness-110 cursor-pointer text-slate-950"
            >
              <Zap className="w-5 h-5 text-slate-950" />
              <span>{loading ? "Initializing 30-Day Quant Bot..." : `Deploy ${currentPlan.type} ($${effectiveAmount.toLocaleString()})`}</span>
            </Button>
          </CardContent>
        </Card>

        {/* User Balance Info */}
        <Card className="border-slate-800 bg-slate-900/90 flex flex-col justify-between shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Your Profile Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Available Wallet Balance</span>
              <p className="text-3xl font-extrabold text-white">{formatCurrency(user?.balance || 0)}</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4" /> Hourly yield credits to harvest anytime
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4" /> Full capital refund at 30-day maturity
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="w-4 h-4" /> Level 1-4 Insurance Aegis coverage
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentTab("wallet")}
              className="w-full text-xs cursor-pointer border-slate-700 hover:border-amber-500"
            >
              + Fund Wallet Balance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Investments List & Yield Harvest Center */}
      <Card className="border-slate-800 bg-slate-900/90 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              <span>Active 30-Day Bot Deployments & Harvest Center</span>
            </CardTitle>
            <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              {activeInvestments.length} Active Bots
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {activeInvestments.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <Bot className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm font-semibold">No active 30-day quant bots currently running.</p>
              <p className="text-slate-500 text-xs">Select a bot tier above and click deploy to begin earning hourly yields!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeInvestments.map((inv) => {
                const claimable = inv.claimableYield || 0;
                return (
                  <div
                    key={inv.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-amber-600/40 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-base">{inv.planType}</span>
                          <Badge variant="success" className="text-[10px]">
                            {inv.status} (30 DAYS)
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Started: {formatDate(inv.startDate)} • Capital: <strong className="text-slate-200">{formatCurrency(inv.amount)}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase block font-bold">Uncollected Bot Yield</span>
                          <span className="text-base font-black text-emerald-400">+{formatCurrency(claimable)}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="gold"
                          disabled={claimable <= 0 || harvestingId === inv.id}
                          onClick={() => handleHarvestYield(inv.id)}
                          className="gold-gradient text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{harvestingId === inv.id ? "Harvesting..." : `Harvest Yield (+${formatCurrency(claimable)})`}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar & Live Stats */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                        <span>
                          Elapsed: <strong>{inv.daysElapsed || 0} / 30 Days</strong> ({inv.hoursElapsed || 0} Hours)
                        </span>
                        <span>
                          Target Profit: <strong className="text-emerald-400">+{formatCurrency(inv.totalProfitTarget || (inv.amount * inv.profitPercent) / 100)}</strong>
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className="gold-gradient h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, inv.progressPercent || 5)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
