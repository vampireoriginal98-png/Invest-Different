import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { DEFAULT_INSURANCE_TIERS } from "@/lib/insurance";
import { Shield, ShieldCheck, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function InsuranceView() {
  const { user, token, updateBalance, setUser } = useAuthStore();
  const [loading, setLoading] = useState<number | null>(null);

  const handlePurchase = async (level: number, cost: number) => {
    if (!user) return;
    if (user.balance < cost) {
      toast.error(`Insufficient balance. Requires $${cost.toFixed(2)}`);
      return;
    }

    setLoading(level);
    try {
      const res = await fetch("/api/insurance/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ level }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to purchase insurance");

      toast.success(`🛡️ Level ${level} Insurance Aegis Activated!`);
      updateBalance(data.newBalance);
      if (user) {
        setUser({ ...user, insuranceLevel: level, balance: data.newBalance }, token);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase insurance");
    } finally {
      setLoading(null);
    }
  };

  const currentLevel = user?.insuranceLevel || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>CAPITAL PROTECTION ENGINE</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Insurance Aegis Shields
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Protect your automated bot portfolios and trade margin against market liquidations or early cancellations. Tiered coverage up to 80% total capital refund.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold">Active Shield Tier</p>
              <p className="text-lg font-black text-amber-400">
                {currentLevel > 0 ? `Level ${currentLevel} Verified` : "No Insurance Shield"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Insurance Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEFAULT_INSURANCE_TIERS.map((tier) => {
          const isCurrent = currentLevel === tier.level;
          const isHigher = currentLevel > tier.level;

          return (
            <div
              key={tier.level}
              className={`relative rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                isCurrent
                  ? "bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950 border-amber-500/60 shadow-xl shadow-amber-500/10"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {tier.badge}
                  </span>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1">Level {tier.level} Shield</h3>
                <div className="text-3xl font-black text-amber-400 my-3">
                  ${tier.cost}{" "}
                  <span className="text-xs font-normal text-slate-400">one-time</span>
                </div>

                <p className="text-xs text-slate-400 mb-6 min-h-[36px]">{tier.description}</p>

                <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capital Loss Coverage</span>
                    <span className="font-bold text-white">{tier.coverage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Yield Protection</span>
                    <span className="font-bold text-amber-300">{tier.profitProtection}% Shielded</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handlePurchase(tier.level, tier.cost)}
                  disabled={isCurrent || isHigher || loading === tier.level}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                      : isHigher
                      ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800"
                      : "gold-gradient text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 font-black"
                  }`}
                >
                  {loading === tier.level ? (
                    "Processing..."
                  ) : isCurrent ? (
                    "Current Shield"
                  ) : isHigher ? (
                    "Covered by Higher Level"
                  ) : (
                    `Upgrade to Level ${tier.level}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
