import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

interface BalanceCardProps {
  balance: number;
  totalDeposited?: number;
  totalEarned?: number;
}

export function BalanceCard({ balance, totalDeposited = 1500, totalEarned = 280.5 }: BalanceCardProps) {
  const { setCurrentTab, user } = useAuthStore();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 p-6 md:p-8 shadow-2xl shadow-amber-950/20">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Wallet className="w-4 h-4" />
            <span>Total Wallet Balance</span>
          </div>
          <div className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Available for withdrawal or instant portfolio reinvestment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="gold"
            size="lg"
            onClick={() => setCurrentTab("wallet")}
            className="flex items-center gap-2"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span>Deposit Funds</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentTab("investments")}
            className="flex items-center gap-2"
          >
            <Zap className="w-5 h-5 text-amber-400" />
            <span>View Plans</span>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
          <p className="text-[11px] text-slate-400 font-medium">Total Deposited</p>
          <p className="text-lg font-bold text-slate-200 mt-0.5">{formatCurrency(user?.totalDeposited || totalDeposited)}</p>
        </div>
        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
          <p className="text-[11px] text-slate-400 font-medium">Total Yield Earned</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatCurrency(totalEarned)}</p>
        </div>
        <div className="col-span-2 md:col-span-1 bg-slate-950/50 rounded-xl p-3 border border-slate-800/50 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Account Protection</p>
            <p className="text-sm font-bold text-amber-400 mt-0.5">Tier {user?.insuranceLevel || 1} Covered</p>
          </div>
          <ShieldCheck className="w-6 h-6 text-amber-400 opacity-80" />
        </div>
      </div>
    </div>
  );
}
