import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { TRADING_PAIRS, calculateTradeOutcome } from "@/lib/tradeEngine";
import { TradeOrder } from "@/types";
import { CandlestickChart, ArrowUp, ArrowDown, DollarSign, Activity, History, Zap, Cpu, Flame, CheckCircle2 } from "lucide-react";
import { DepositModal } from "@/components/ui/DepositModal";
import toast from "react-hot-toast";

export function BrokerView() {
  const { user, token, updateBalance } = useAuthStore();
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [livePrice, setLivePrice] = useState<number>(TRADING_PAIRS[0].basePrice);
  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [leverage, setLeverage] = useState<number>(100);
  const [history, setHistory] = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Simulated live chart price bars and depth
  const [candles, setCandles] = useState<number[]>([100, 102, 101, 105, 104, 108, 106, 110, 109, 112]);
  const [orderBook, setOrderBook] = useState<{ bids: number[]; asks: number[] }>({
    bids: [],
    asks: [],
  });

  useEffect(() => {
    setLivePrice(selectedPair.basePrice);
  }, [selectedPair]);

  // Spontaneous Ticks & Orderbook depth updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.random() - 0.48) * (selectedPair.basePrice * 0.002);
        const next = Number((prev + delta).toFixed(2));
        
        setCandles((oldCandles) => {
          return [...oldCandles.slice(1), next];
        });

        // Update bids/asks depth around livePrice
        setOrderBook({
          bids: [
            Number((next - 0.05).toFixed(2)),
            Number((next - 0.12).toFixed(2)),
            Number((next - 0.25).toFixed(2)),
          ],
          asks: [
            Number((next + 0.05).toFixed(2)),
            Number((next + 0.14).toFixed(2)),
            Number((next + 0.28).toFixed(2)),
          ],
        });

        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [selectedPair]);

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
      setShowDepositModal(true);
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
          entryPrice: livePrice,
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        requiredAmount={tradeAmount}
        featureName={`Order Execution for ${selectedPair.symbol}`}
      />

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <CandlestickChart className="w-4 h-4" />
              <span>HIGH-FREQUENCY BROKER TERMINAL</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              MT5 / Binance Hybrid Broker Engine
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Leveraged Forex, Crypto & Commodity order execution engine with real-time orderbook depth, spontaneous tick pricing, and instant execution.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Latency & Matching Engine</p>
              <p className="text-xs font-black text-emerald-400">0.8ms HIGH-FREQUENCY TICK</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Terminal & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pair Switcher */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
            {TRADING_PAIRS.map((p) => (
              <button
                key={p.symbol}
                onClick={() => setSelectedPair(p)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedPair.symbol === p.symbol
                    ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {p.symbol}
              </button>
            ))}
          </div>

          {/* Simulated Chart Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-white">{selectedPair.name} ({selectedPair.symbol})</h3>
                <p className="text-xs text-slate-400 font-mono">Real-Time Tick Rate: <strong className="text-amber-400">${livePrice.toFixed(2)}</strong> | Gas Fee: <strong className="text-emerald-400">$0.00 FREE</strong></p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl w-fit">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> SPONTANEOUS TICKING
              </span>
            </div>

            {/* Candlestick Visualization */}
            <div className="h-52 bg-slate-950/90 rounded-2xl border border-slate-800 p-4 flex items-end justify-between gap-2 overflow-hidden relative">
              <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-500 uppercase">
                5s Candlestick Feed (100x Leverage Active)
              </div>
              {candles.map((val, idx) => {
                const prevVal = candles[idx - 1] || val;
                const isUp = val >= prevVal;
                const min = Math.min(...candles);
                const max = Math.max(...candles) || 1;
                const heightPercent = Math.max(15, Math.min(90, ((val - min) / (max - min || 1)) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[18px] rounded-t-sm transition-all duration-300 ${
                        isUp ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-rose-500 shadow-lg shadow-rose-500/20"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Orderbook Depth Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold block mb-1">ASKS / SELL ORDERS (DEPTH)</span>
                {orderBook.asks.map((ask, i) => (
                  <div key={i} className="flex justify-between text-slate-300 text-[11px]">
                    <span>${ask}</span>
                    <span className="text-slate-500">{(Math.random() * 2 + 0.5).toFixed(2)} Vol</span>
                  </div>
                ))}
              </div>
              <div>
                <span className="text-[10px] text-rose-400 font-bold block mb-1">BIDS / BUY ORDERS (DEPTH)</span>
                {orderBook.bids.map((bid, i) => (
                  <div key={i} className="flex justify-between text-slate-300 text-[11px]">
                    <span>${bid}</span>
                    <span className="text-slate-500">{(Math.random() * 2 + 0.5).toFixed(2)} Vol</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Position Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min="5"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Leverage Multiplier</label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value={10}>10x Leverage</option>
                  <option value={50}>50x Leverage</option>
                  <option value={100}>100x Leverage (Standard)</option>
                  <option value={500}>500x Max Leverage</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleExecuteTrade("BUY")}
                disabled={loading}
                className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Execute Long (Buy)</span>
              </button>

              <button
                onClick={() => handleExecuteTrade("SELL")}
                disabled={loading}
                className="py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <ArrowDown className="w-4 h-4" />
                <span>Execute Short (Sell)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trade Order History */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Executed Trade Orders</span>
          </h2>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-sm">
                No active or historical order entries. Execute a trade order above.
              </div>
            ) : (
              history.map((o) => (
                <div key={o.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        o.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {o.type}
                      </span>
                      <span className="font-bold text-white text-xs">{o.pair}</span>
                    </div>
                    <span className={`text-xs font-black ${
                      o.profitAmount >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {o.profitAmount >= 0 ? `+$${o.profitAmount}` : `-$${Math.abs(o.profitAmount)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Position: ${o.amount} ({o.leverage}x)</span>
                    <span>Entry: ${o.entryPrice}</span>
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
