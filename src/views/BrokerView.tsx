import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { TRADING_PAIRS, calculateTradeOutcome } from "@/lib/tradeEngine";
import { TradeOrder } from "@/types";
import { CandlestickChart, ArrowUp, ArrowDown, DollarSign, Activity, History, Zap } from "lucide-react";
import toast from "react-hot-toast";

export function BrokerView() {
  const { user, token, updateBalance } = useAuthStore();
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [leverage, setLeverage] = useState<number>(100);
  const [history, setHistory] = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulated live chart price bars
  const [candles, setCandles] = useState<number[]>([100, 102, 101, 105, 104, 108, 106, 110, 109, 112]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const next = last + (Math.random() - 0.48) * 2;
        return [...prev.slice(1), Number(next.toFixed(2))];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/broker/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setHistory(data.orders || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteTrade = async (type: "BUY" | "SELL") => {
    if (!user) return;
    if (tradeAmount < 5) {
      toast.error("Minimum trade amount is $5");
      return;
    }
    if (user.balance < tradeAmount) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setLoading(true);
    // Dynamic win/loss calculation based on amount bracket
    const outcome = calculateTradeOutcome(user.id, tradeAmount);

    try {
      const res = await fetch("/api/broker/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pair: selectedPair.symbol,
          type,
          amount: tradeAmount,
          leverage,
          entryPrice: selectedPair.basePrice,
          outcomeWin: outcome.win,
          profitAmount: outcome.profit,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Trade failed");

      if (outcome.win) {
        toast.success(`🎉 WIN! +$${outcome.profit} earned on ${selectedPair.symbol}`);
      } else {
        toast.error(`📉 Trade closed: -$${Math.abs(outcome.profit)} on ${selectedPair.symbol}`);
      }

      updateBalance(data.newBalance);
      fetchHistory();
    } catch (err: any) {
      toast.error(err.message || "Failed to execute trade order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <CandlestickChart className="w-4 h-4" />
              <span>HIGH-FREQUENCY BROKER ENGINE</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              MT5 / Binance Hybrid Broker Replica
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Leveraged Forex & Crypto order execution terminal with real-time simulated order matching and custom risk engine.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Terminal & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pair Switcher */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TRADING_PAIRS.map((p) => (
              <button
                key={p.symbol}
                onClick={() => setSelectedPair(p)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedPair.symbol === p.symbol
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {p.symbol}
              </button>
            ))}
          </div>

          {/* Simulated Chart Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedPair.name} ({selectedPair.symbol})</h3>
                <p className="text-xs text-slate-400">Current Rate: ${selectedPair.basePrice}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> LIVE TERMINAL
              </span>
            </div>

            {/* Simulated Candlestick Visualization */}
            <div className="h-48 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 flex items-end justify-between gap-2 overflow-hidden">
              {candles.map((val, idx) => {
                const prevVal = idx > 0 ? candles[idx - 1] : val;
                const isGreen = val >= prevVal;
                const heightPct = Math.min(Math.max(((val - 90) / 30) * 100, 15), 90);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[18px] rounded-t transition-all duration-300 ${
                        isGreen ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" : "bg-rose-500 shadow-sm shadow-rose-500/30"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Trading Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  Order Margin ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min="5"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  Leverage ({leverage}x)
                </label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value={10}>10x</option>
                  <option value={50}>50x</option>
                  <option value={100}>100x</option>
                  <option value={200}>200x</option>
                  <option value={500}>500x Max</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleExecuteTrade("BUY")}
                disabled={loading}
                className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <ArrowUp className="w-5 h-5" /> BUY / LONG
              </button>
              <button
                onClick={() => handleExecuteTrade("SELL")}
                disabled={loading}
                className="py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                <ArrowDown className="w-5 h-5" /> SELL / SHORT
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Trade Log */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Order Execution History</span>
          </h2>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No closed trades yet. Select margin and place Buy/Sell order above.
              </div>
            ) : (
              history.map((t) => (
                <div key={t.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{t.pair}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.type === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {t.type} {t.leverage}x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Margin: ${t.amount}</p>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-sm ${t.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.profit >= 0 ? `+$${t.profit}` : `-$${Math.abs(t.profit)}`}
                    </span>
                    <p className="text-[10px] text-slate-500">{t.outcome}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
