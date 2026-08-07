import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Activity } from "lucide-react";
import toast from "react-hot-toast";

export function PredictTrendView() {
  const { user, token, updateBalance } = useAuthStore();
  const [betAmount, setBetAmount] = useState<number>(25);
  const [prediction, setPrediction] = useState<"UP" | "DOWN">("UP");
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!user) return;
    if (betAmount < 5) {
      toast.error("Minimum bet is $5");
      return;
    }
    if (user.balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    // 50% randomized payout simulation
    const win = Math.random() > 0.45;
    const profit = win ? betAmount : -betAmount;

    setTimeout(async () => {
      try {
        const res = await fetch("/api/broker/trade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pair: "BTC/USD 1m Trend",
            type: prediction === "UP" ? "BUY" : "SELL",
            amount: betAmount,
            leverage: 1,
            entryPrice: 64200,
            outcomeWin: win,
            profitAmount: profit,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Prediction failed");

        if (win) {
          toast.success(`🎉 Correct Trend! You doubled your bet: +$${betAmount * 2}`);
        } else {
          toast.error(`📉 Trend went against prediction: -$${betAmount}`);
        }

        updateBalance(data.newBalance);
      } catch (err: any) {
        toast.error(err.message || "Failed prediction");
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 p-8 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <TrendingUp className="w-4 h-4" />
          <span>BINARY TREND PREDICTION</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Predict the Trend (2x Payout)
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto mt-1">
          Predict whether Bitcoin (BTC/USD) will move UP or DOWN over the next 60 seconds. Correct predictions instantly pay out 2x your bet.
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <p className="text-xs uppercase text-slate-400 font-bold">BTC/USD Live Index</p>
          <p className="text-3xl font-black text-emerald-400">$64,280.50</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase">Bet Capital ($)</label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="number"
              min="5"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPrediction("UP")}
            className={`py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              prediction === "UP"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black ring-2 ring-emerald-400"
                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <ArrowUpRight className="w-5 h-5" /> PREDICT UP
          </button>

          <button
            onClick={() => setPrediction("DOWN")}
            className={`py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              prediction === "DOWN"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-black ring-2 ring-rose-400"
                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <ArrowDownRight className="w-5 h-5" /> PREDICT DOWN
          </button>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full py-4 gold-gradient text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 hover:brightness-110 cursor-pointer"
        >
          {loading ? "Analyzing Market..." : `SUBMIT $${betAmount} PREDICTION`}
        </button>
      </div>
    </div>
  );
}
