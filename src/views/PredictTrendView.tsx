import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Activity, Clock, ShieldCheck, Zap, Award, History } from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

interface PredictionRecord {
  id: string;
  pair: string;
  prediction: "UP" | "DOWN";
  amount: number;
  outcome: "WIN" | "LOSS";
  profit: number;
  timestamp: string;
}

export function PredictTrendView() {
  const { user, token, updateBalance } = useAuthStore();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [prediction, setPrediction] = useState<"UP" | "DOWN">("UP");
  const [loading, setLoading] = useState(false);
  const [liveBtcPrice, setLiveBtcPrice] = useState<number>(68420.50);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [history, setHistory] = useState<PredictionRecord[]>([]);

  // Ticking BTC live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBtcPrice((prev) => {
        const delta = (Math.random() - 0.49) * 45;
        return Number((prev + delta).toFixed(2));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handlePredict = async () => {
    if (!user) return;
    if (betAmount < 5) {
      toast.error("Minimum prediction capital is $5");
      return;
    }
    if ((user.balance || 0) < betAmount) {
      toast.error("Insufficient wallet balance for this prediction");
      return;
    }

    setLoading(true);
    setCountdown(5);

    // 5-second animated countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const win = Math.random() > 0.42;
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
            pair: "BTC/USD 60s Binary Trend",
            type: prediction === "UP" ? "BUY" : "SELL",
            amount: betAmount,
            leverage: 1,
            entryPrice: liveBtcPrice,
            outcomeWin: win,
            profitAmount: profit,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Prediction failed");

        if (win) {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          toast.success(`🎉 Correct Trend Prediction! You won +$${(betAmount * 2).toFixed(2)} cash payout!`);
        } else {
          toast.error(`📉 Market moved against prediction: -$${betAmount.toFixed(2)}`);
        }

        if (data.newBalance !== undefined) {
          updateBalance(data.newBalance);
        }

        const newRecord: PredictionRecord = {
          id: "pred_" + Date.now(),
          pair: "BTC/USD",
          prediction,
          amount: betAmount,
          outcome: win ? "WIN" : "LOSS",
          profit,
          timestamp: new Date().toLocaleTimeString(),
        };

        setHistory((prev) => [newRecord, ...prev.slice(0, 7)]);
      } catch (err: any) {
        toast.error(err.message || "Failed prediction execution");
      } finally {
        setLoading(false);
        setCountdown(null);
      }
    }, 5000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-amber-600/50 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/40 text-amber-400 text-xs font-black mb-3">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>HIGH-FREQUENCY BINARY OPTIONS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Classy Binary Trend Predictor
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mt-1.5 leading-relaxed">
              Predict whether BTC/USD will tick <strong>UP (Call)</strong> or <strong>DOWN (Put)</strong> over the 5-second micro execution window. Win 2x instant payout added straight to your profile balance!
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shrink-0 shadow-xl">
            <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-600/50 text-amber-500">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">BTC/USD Index Rate</p>
              <p className="text-2xl font-black text-emerald-400 font-mono">${liveBtcPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prediction Interface */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" /> Select Market Direction
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
              Payout: 2.0x (100% Return)
            </span>
          </div>

          {/* Preset Bet Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Prediction Capital ($ USD)
            </label>
            <div className="flex items-center gap-2">
              {[25, 50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  onClick={() => setBetAmount(val)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    betAmount === val
                      ? "bg-amber-600 text-slate-950 font-black shadow-lg"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
            <div className="relative mt-2">
              <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min="5"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Direction Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPrediction("UP")}
              disabled={loading}
              className={`py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                prediction === "UP"
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-black ring-2 ring-emerald-400"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-6 h-6" /> PREDICT UP (BULL)
            </button>

            <button
              onClick={() => setPrediction("DOWN")}
              disabled={loading}
              className={`py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                prediction === "DOWN"
                  ? "bg-rose-600 text-white shadow-xl shadow-rose-600/30 font-black ring-2 ring-rose-400"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              <ArrowDownRight className="w-6 h-6" /> PREDICT DOWN (BEAR)
            </button>
          </div>

          {/* Submit Action */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-4 gold-gradient text-slate-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 animate-spin text-slate-950" />
                Analyzing Market Delta ({countdown}s)...
              </span>
            ) : (
              `Lock In $${betAmount} ${prediction} Prediction`
            )}
          </button>
        </div>

        {/* Prediction History Log */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <History className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Predictions</h3>
            </div>

            <div className="space-y-2.5 mt-3">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">No predictions executed yet this session.</p>
              ) : (
                history.map((rec) => (
                  <div key={rec.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className={`font-black font-mono ${rec.prediction === "UP" ? "text-emerald-400" : "text-rose-400"}`}>
                        {rec.prediction === "UP" ? "▲ UP" : "▼ DOWN"}
                      </span>
                      <p className="text-[10px] text-slate-500">{rec.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${rec.outcome === "WIN" ? "text-emerald-400" : "text-rose-400"}`}>
                        {rec.outcome === "WIN" ? `+$${(rec.amount * 2).toFixed(2)}` : `-$${rec.amount.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-amber-400 block">🛡️ Guaranteed Instant Payout:</span>
            <p>All successful binary trend predictions credit profits directly into your account balance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
