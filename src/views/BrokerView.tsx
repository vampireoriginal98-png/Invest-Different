import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { TRADING_PAIRS, calculateTradeOutcome } from "@/lib/tradeEngine";
import { TradeOrder } from "@/types";
import {
  CandlestickChart,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Activity,
  History,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  Fuel,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";

interface ChartCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  color: string;
  bodyLow: number;
  bodyHeight: number;
}

export function BrokerView() {
  const { user, token, updateBalance, setCurrentTab } = useAuthStore();
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [livePrice, setLivePrice] = useState<number>(TRADING_PAIRS[0].basePrice);
  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [leverage, setLeverage] = useState<number>(100);
  const [history, setHistory] = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Spontaneous Gas Fee & Spread Volatility State
  const [liveGasFee, setLiveGasFee] = useState<number>(1.85);
  const [liveSpread, setLiveSpread] = useState<number>(0.4);

  // Recharts Candlestick series
  const [chartData, setChartData] = useState<ChartCandle[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: number[]; asks: number[] }>({
    bids: [],
    asks: [],
  });

  // Initializing Chart Data for selected pair
  useEffect(() => {
    setLivePrice(selectedPair.basePrice);
    const base = selectedPair.basePrice;
    const initial: ChartCandle[] = [];
    let current = base;

    for (let i = 20; i >= 1; i--) {
      const delta = (Math.random() - 0.48) * (base * 0.003);
      const open = Number((current).toFixed(2));
      const close = Number((current + delta).toFixed(2));
      const high = Number((Math.max(open, close) + Math.random() * (base * 0.0015)).toFixed(2));
      const low = Number((Math.min(open, close) - Math.random() * (base * 0.0015)).toFixed(2));
      const isUp = close >= open;

      initial.push({
        time: `${i}s ago`,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 500 + 100),
        color: isUp ? "#10b981" : "#f43f5e",
        bodyLow: Math.min(open, close),
        bodyHeight: Math.max(0.01, Math.abs(close - open)),
      });
      current = close;
    }
    setChartData(initial);
  }, [selectedPair]);

  // Spontaneous Price Ticking, Gas Fee & Spread Volatility
  useEffect(() => {
    const interval = setInterval(() => {
      // Volatile Gas & Spread Ticking
      setLiveGasFee(Number((1.20 + Math.random() * 2.80).toFixed(2)));
      setLiveSpread(Number((0.2 + Math.random() * 1.4).toFixed(1)));

      setLivePrice((prev) => {
        const delta = (Math.random() - 0.48) * (selectedPair.basePrice * 0.002);
        const nextClose = Number((prev + delta).toFixed(2));
        const open = prev;
        const high = Number((Math.max(open, nextClose) + Math.random() * (selectedPair.basePrice * 0.001)).toFixed(2));
        const low = Number((Math.min(open, nextClose) - Math.random() * (selectedPair.basePrice * 0.001)).toFixed(2));
        const isUp = nextClose >= open;

        setChartData((prevChart) => {
          const newCandle: ChartCandle = {
            time: "Now",
            open,
            high,
            low,
            close: nextClose,
            volume: Math.floor(Math.random() * 800 + 200),
            color: isUp ? "#10b981" : "#f43f5e",
            bodyLow: Math.min(open, nextClose),
            bodyHeight: Math.max(0.01, Math.abs(nextClose - open)),
          };
          return [...prevChart.slice(1), newCandle];
        });

        // Live Orderbook Depth
        setOrderBook({
          asks: [
            Number((nextClose + 0.08).toFixed(2)),
            Number((nextClose + 0.18).toFixed(2)),
            Number((nextClose + 0.35).toFixed(2)),
          ],
          bids: [
            Number((nextClose - 0.08).toFixed(2)),
            Number((nextClose - 0.19).toFixed(2)),
            Number((nextClose - 0.32).toFixed(2)),
          ],
        });

        return nextClose;
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
      toast.error("Minimum order size is $5");
      return;
    }

    // Balance check & automatic redirection
    if (user.balance < tradeAmount) {
      toast.error(`Insufficient balance ($${user.balance.toFixed(2)}). Redirecting to Deposit...`);
      setTimeout(() => {
        setCurrentTab("wallet");
      }, 1000);
      return;
    }

    setLoading(true);
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
      if (!res.ok) throw new Error(data.error || "Trade execution failed");

      if (outcome.win) {
        toast.success(`🎉 ORDER PROFITABLE! +$${outcome.profit} on ${selectedPair.symbol}`);
      } else {
        toast.error(`📉 Order closed: -$${Math.abs(outcome.profit)} on ${selectedPair.symbol}`);
      }

      updateBalance(data.newBalance);
      fetchHistory();
    } catch (err: any) {
      toast.error(err.message || "Failed to execute order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Glassmorphic Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <CandlestickChart className="w-4 h-4 text-amber-400" />
              <span>INSTITUTIONAL TRADE MARKET & MATCHING ENGINE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Real-Time Trade Market
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1">
              Leveraged Forex, Crypto & Commodity order execution with real-time volatility markers, spontaneous ticking feeds, and low-latency matching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono">
              <span className="text-slate-500 block text-[10px]">LIVE NETWORK GAS</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> ${liveGasFee} / Tx
              </span>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono">
              <span className="text-slate-500 block text-[10px]">FLOAT SPREAD</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> {liveSpread} pips
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Terminal & Candlestick Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pair Switcher */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
            {TRADING_PAIRS.map((p) => (
              <button
                key={p.symbol}
                onClick={() => setSelectedPair(p)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedPair.symbol === p.symbol
                    ? "gold-gradient text-slate-950 font-black shadow-lg shadow-amber-500/20"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {p.symbol}
              </button>
            ))}
          </div>

          {/* Chart Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">{selectedPair.name} ({selectedPair.symbol})</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Live Rate: <strong className="text-amber-400">${livePrice.toFixed(2)}</strong> | Gas Fee: <strong className="text-amber-300">${liveGasFee}</strong> | Spread: <strong className="text-emerald-400">{liveSpread} pips</strong>
                </p>
              </div>

              <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl w-fit">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> SPONTANEOUS TICKING
              </span>
            </div>

            {/* Recharts Interactive Candlestick / Price Chart */}
            <div className="h-64 w-full bg-slate-950/90 rounded-2xl border border-slate-800/80 p-3 pt-6 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={["auto", "auto"]} stroke="#64748b" fontSize={10} tickLine={false} orientation="right" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Line type="monotone" dataKey="close" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Bar dataKey="bodyHeight" fill="#10b981">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Orderbook Depth Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-950/90 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold block mb-1.5">ASKS / SELL ORDERS</span>
                {orderBook.asks.map((ask, i) => (
                  <div key={i} className="flex justify-between text-slate-300 text-[11px] py-0.5">
                    <span>${ask}</span>
                    <span className="text-slate-500">{(Math.random() * 2 + 0.5).toFixed(2)} Vol</span>
                  </div>
                ))}
              </div>
              <div>
                <span className="text-[10px] text-rose-400 font-bold block mb-1.5">BIDS / BUY ORDERS</span>
                {orderBook.bids.map((bid, i) => (
                  <div key={i} className="flex justify-between text-slate-300 text-[11px] py-0.5">
                    <span>${bid}</span>
                    <span className="text-slate-500">{(Math.random() * 2 + 0.5).toFixed(2)} Vol</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Position Size ($)</label>
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

            {/* Balance Check Indicator */}
            {user && user.balance < tradeAmount && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  Insufficient wallet balance (${user.balance.toFixed(2)}). Deposit required to execute.
                </span>
                <button
                  onClick={() => setCurrentTab("wallet")}
                  className="px-3 py-1 rounded-xl gold-gradient text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                >
                  Deposit <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

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
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-sm backdrop-blur-md">
                No active or historical order entries. Execute a trade order above.
              </div>
            ) : (
              history.map((o) => (
                <div key={o.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg backdrop-blur-md">
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
