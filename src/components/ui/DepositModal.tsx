import React from "react";
import { useAuthStore } from "@/store/authStore";
import { Wallet, AlertCircle, ArrowRight, X } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: number;
  featureName: string;
}

export function DepositModal({ isOpen, onClose, requiredAmount, featureName }: DepositModalProps) {
  const { user, setCurrentTab } = useAuthStore();
  if (!isOpen) return null;

  const currentBalance = user?.balance || 0;
  const missingAmount = Math.max(0, requiredAmount - currentBalance);

  const handleRedirectToDeposit = () => {
    onClose();
    setCurrentTab("wallet");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-5 relative shadow-2xl shadow-amber-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Insufficient Wallet Balance</h3>
            <p className="text-xs text-amber-400/90 font-medium">Deposit required for {featureName}</p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Required Capital:</span>
            <span className="text-white font-bold">${requiredAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Available Balance:</span>
            <span className="text-slate-300 font-bold">${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between text-xs">
            <span className="text-amber-400 font-bold">Shortfall / Needed:</span>
            <span className="text-amber-400 font-black">${missingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Your wallet balance is currently lower than the minimum required amount to execute this transaction. Please make a deposit to activate this asset and unlock daily compounding returns.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleRedirectToDeposit}
            className="flex-1 gold-gradient py-3 rounded-xl text-slate-950 text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Deposit Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
