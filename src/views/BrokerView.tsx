import React, { useState, useEffect, useRef } from "react";
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
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  Fuel,
  Clock,
  Timer,
  Play,
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

interface ChartCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  color: string;
}

interface ActivePosition {
  id: string;
  pair: string;
  type: "BUY" | "SELL";
  amount: number;
  leverage: number;
  entryPrice: number;
  durationSeconds: number;
  remainingSeconds: number;
  startTime: number;
}

const TIMEFRAMES = [
  { label: "1M", intervalMs: 1000, name: "1 Minute" },
  { label: "3M", intervalMs: 2000, name: "3 Minutes" },
  { label: "5M", intervalMs: 3000, name: "5 Minutes" },
  { label: "15M", intervalMs: 5000, name: "15 Minutes" },
  { label: "30M", intervalMs: 8000, name: "30 Minutes" },
  { label: "1H", intervalMs: 12000, name: "1 Hour" },
];

const TRADE_EXPIRATIONS = [
  { label: "60 Sec", seconds: 60 },
  { label: "3 Min", seconds: 180 },
  { label: "5 Min", seconds: 300 },
  { label: "15 Min", seconds: 900 },
];

export function BrokerView() {
  const { user, token, updateBalance, setCurrentTab } = useAuthStore();
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);
  const [selectedDuration, setSelectedDuration] = useState(TRADE_EXPIRATIONS[0]);

  // Map storing candle history for EACH pair independently
  const [pairPrices, setPairPrices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    TRADING_PAIRS.forEach((p) => {
      init[p.symbol] = p.basePrice;
    });
    return init;
  });

  const [pairCharts, setPairCharts] = useState<Record<string, ChartCandle[]>>(() => {
    const init: Record<string, ChartCandle[]> = {};
    TRADING_PAIRS.forEach((p) => {
      const base = p.basePrice;
      const candles: ChartCandle[] = [];
      let current = base;

      for (let i = 25; i >= 1; i--) {
        const volatility = base * 0.003;
        const delta = (Math.random() - 0.49) * volatility;
        const open = Number(current.toFixed(2));
        const close = Number((current + delta).toFixed(2));
        const high = Number((Math.max(open, close) + Math.random() * (volatility * 0.8)).toFixed(2));
        const low = Number((Math.min(open, close) - Math.random() * (volatility * 0.8)).toFixed(2));
        const isUp = close >= open;

        candles.push({
          time: `${i * 2}s ago`,
          open,
          high,
          low,
          close,
          volume: Math.floor(Math.random() * 500 + 100),
          color: isUp ? "#10b981" : "#f43f5e",
        });
        current = close;
      }
      init[p.symbol] = candles;
    });
    return init;
  });

  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [leverage, setLeverage] = useState<number>(100);
  const [history, setHistory] = useState<TradeOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Active Live Position Countdown State
  const [activePosition, setActivePosition] = useState<ActivePosition | null>(null);

  // Spontaneous Gas Fee & Spread State
  const [liveGasFee, setLiveGasFee] = useState<number>(1.85);
  const [liveSpread, setLiveSpread] = useState<number>(0.4);

  // Independent Price Ticking per pair
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGasFee(Number((1.20 + Math.random() * 2.80).toFixed(2)));
      setLiveSpread(Number((0.2 + Math.random() * 1.4).toFixed(1)));

      setPairPrices((prevPrices) => {
        const nextPrices = { ...prevPrices };

        TRADING_PAIRS.forEach((p) => {
          const currentPrice = prevPrices[p.symbol] || p.basePrice;
          const volatility = p.basePrice * 0.0018;
          const delta = (Math.random() - 0.49) * volatility;
          const open = currentPrice;
          const nextClose = Number((currentPrice + delta).toFixed(2));
          const high = Number((Math.max(open, nextClose) + Math.random() * (volatility * 0.5)).toFixed(2));
          const low = Number((Math.min(open, nextClose) - Math.random() * (volatility * 0.5)).toFixed(2));
          const isUp = nextClose >= open;

          nextPrices[p.symbol] = nextClose;

          // Update chart candles for this pair
          setPairCharts((prevCharts) => {
            const candles = prevCharts[p.symbol] || [];
            const newCandle: ChartCandle = {
              time: "Now",
              open,
              high,
              low,
              close: nextClose,
              volume: Math.floor(Math.random() * 800 + 200),
              color: isUp ? "#10b981" : "#f43f5e",
            };
            return {
              ...prevCharts,
              [p.symbol]: [...candles.slice(1), newCandle],
            };
          });
        });

        return nextPrices;
      });
    }, selectedTimeframe.intervalMs);

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  // Active Trade Countdown Timer Tick
  useEffect(() => {
    if (!activePosition) return;

    const timer = setInterval(() => {
      setActivePosition((prev) => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          // Resolve Trade Order automatically!
          finalizeTradePosition(prev);
          return null;
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activePosition]);

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

  const handleStartTradePosition = (type: "BUY" | "SELL") => {
    if (!user) return;
    if (tradeAmount < 5) {
      toast.error("Minimum order size is $5");
      return;
    }

    if (user.balance < tradeAmount) {
      toast.error(`Insufficient balance ($${user.balance.toFixed(2)}). Redirecting to Deposit...`);
      setTimeout(() => setCurrentTab("wallet"), 1000);
      return;
    }

    if (activePosition) {
      toast.error("You currently have an active trade order running! Wait for expiration.");
      return;
    }

    const currentLivePrice = pairPrices[selectedPair.symbol] || selectedPair.basePrice;

    const newPos: ActivePosition = {
      id: "pos_" + Date.now(),
      pair: selectedPair.symbol,
      type,
      amount: tradeAmount,
      leverage,
      entryPrice: currentLivePrice,
      durationSeconds: selectedDuration.seconds,
      remainingSeconds: selectedDuration.seconds,
      startTime: Date.now(),
    };

    setActivePosition(newPos);
    toast.success(`🚀 ${type} position opened on ${selectedPair.symbol} @ $${currentLivePrice.toFixed(2)}!`);
  };

  const finalizeTradePosition = async (pos: ActivePosition) => {
    setLoading(true);
    const exitPrice = pairPrices[pos.pair] || pos.entryPrice;
    const isBuy = pos.type === "BUY";
    const priceDiff = exitPrice - pos.entryPrice;

    // Pixel perfect binary decision
    const userWon = isBuy ? priceDiff > 0 : priceDiff < 0;
    const outcome = calculateTradeOutcome(user?.id || "usr_default", pos.amount);

    // Enforce win/loss payout
    const finalWin = userWon;
    const profitVal = finalWin ? Number((pos.amount * 0.85).toFixed(2)) : -pos.amount;

    try {
      const res = await fetch("/api/broker/trade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pair: pos.pair,
          type: pos.type,
          amount: pos.amount,
          leverage: pos.leverage,
          entryPrice: pos.entryPrice,
          outcomeWin: finalWin,
          profitAmount: profitVal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Trade execution failed");

      if (finalWin) {
        confetti({ particleCount: 80, spread: 70 });
        toast.success(`🎉 TRADE PROFITABLE! +$${profitVal} on ${pos.pair}!`);
      } else {
        toast.error(`📉 Order Expired: -$${Math.abs(profitVal)} on ${pos.pair}`);
      }

      updateBalance(data.newBalance);
      fetchHistory();
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize trade");
    } finally {
      setLoading(false);
    }
  };

  const currentPairPrice = pairPrices[selectedPair.symbol] || selectedPair.basePrice;
  const currentChart = pairCharts[selectedPair.symbol] || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <CandlestickChart className="w-4 h-4 text-amber-400" />
              <span>INSTITUTIONAL QUANT MATCHING ENGINE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Real-Time Trading Terminal
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mt-1">
              Independent asset charts, green/red candlestick price action, adjustable timeframes, and pixel-perfect trade execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono">
              <span className="text-slate-500 block text-[10px]">NETWORK GAS</span>
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
          {/* Asset Switcher */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
            {TRADING_PAIRS.map((p) => {
              const liveVal = pairPrices[p.symbol] || p.basePrice;
              const isSelected = selectedPair.symbol === p.symbol;
              return (
                <button
                  key={p.symbol}
                  onClick={() => setSelectedPair(p)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "gold-gradient text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-[1.02]"
                      : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  <span>{p.symbol}</span>
                  <span className={`font-mono text-[11px] ${isSelected ? "text-slate-950" : "text-amber-400"}`}>
                    ${liveVal.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Live Position Banner */}
          {activePosition && (
            <div className="p-5 rounded-3xl bg-amber-950/40 border border-amber-500/50 shadow-2xl space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                    activePosition.type === "BUY" ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
                  }`}>
                    {activePosition.type === "BUY" ? "▲ CALL (LONG)" : "▼ PUT (SHORT)"}
                  </span>
                  <span className="font-bold text-white text-sm">{activePosition.pair}</span>
                  <span className="text-xs text-slate-400 font-mono">Size: ${activePosition.amount} ({activePosition.leverage}x)</span>
                </div>

                <div className="flex items-center gap-1.5 font-mono font-black text-amber-400 text-sm">
                  <Timer className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>{Math.floor(activePosition.remainingSeconds / 60)}:{(activePosition.remainingSeconds % 60).toString().padStart(2, "0")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Entry Price</span>
                  <strong className="text-white">${activePosition.entryPrice.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Live Price</span>
                  <strong className="text-amber-400">${currentPairPrice.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Est. Payout</span>
                  <strong className="text-emerald-400">+${(activePosition.amount * 0.85).toFixed(2)} (+85%)</strong>
                </div>
              </div>
            </div>
          )}

          {/* Chart Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 backdrop-blur-md shadow-2xl">
            {/* Chart Top Bar with Timeframe Selectors */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">{selectedPair.name} ({selectedPair.symbol})</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Live Market Price: <strong className="text-amber-400">${currentPairPrice.toFixed(2)}</strong> | Spread: <strong className="text-emerald-400">{liveSpread} pips</strong>
                </p>
              </div>

              {/* Timeframe selector buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[11px] font-bold">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.label}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      selectedTimeframe.label === tf.label
                        ? "bg-amber-600 text-slate-950 font-black shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Authentic SVG Candlestick Chart */}
            <div className="h-72 w-full bg-slate-950 rounded-2xl border border-slate-800/90 p-4 relative overflow-hidden flex flex-col justify-between">
              {(() => {
                if (currentChart.length === 0) return null;
                const lows = currentChart.map((c) => c.low);
                const highs = currentChart.map((c) => c.high);
                const minP = Math.min(...lows) * 0.998;
                const maxP = Math.max(...highs) * 1.002;
                const pRange = maxP - minP || 1;
                const chartH = 220;

                return (
                  <div className="relative w-full h-[220px]">
                    {/* Background Price Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const val = maxP - ratio * pRange;
                      return (
                        <div
                          key={i}
                          className="absolute w-full border-b border-slate-800/40 flex justify-end pr-2 text-[9px] font-mono text-slate-500"
                          style={{ top: `${ratio * 100}%` }}
                        >
                          ${val.toFixed(2)}
                        </div>
                      );
                    })}

                    {/* SVG Candlesticks */}
                    <svg className="w-full h-full overflow-visible">
                      {currentChart.map((c, idx) => {
                        const totalCandles = currentChart.length;
                        const pctX = ((idx + 0.5) / totalCandles) * 100;
                        const yHigh = chartH - ((c.high - minP) / pRange) * chartH;
                        const yLow = chartH - ((c.low - minP) / pRange) * chartH;
                        const yOpen = chartH - ((c.open - minP) / pRange) * chartH;
                        const yClose = chartH - ((c.close - minP) / pRange) * chartH;

                        const isUp = c.close >= c.open;
                        const color = isUp ? "#10b981" : "#f43f5e";
                        const yTop = Math.min(yOpen, yClose);
                        const bodyH = Math.max(3, Math.abs(yClose - yOpen));

                        return (
                          <g key={idx}>
                            {/* Wick Line */}
                            <line
                              x1={`${pctX}%`}
                              y1={yHigh}
                              x2={`${pctX}%`}
                              y2={yLow}
                              stroke={color}
                              strokeWidth={1.5}
                            />
                            {/* Candle Body Box */}
                            <rect
                              x={`calc(${pctX}% - 5px)`}
                              y={yTop}
                              width={10}
                              height={bodyH}
                              fill={color}
                              rx={1}
                              className="transition-all duration-300 hover:opacity-80"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
                <span>-5m</span>
                <span>-3m</span>
                <span>-1m</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE TICK ({selectedTimeframe.name})
                </span>
              </div>
            </div>

            {/* Trade Expiration Selection Bar */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">
                Select Trade Duration Expiration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRADE_EXPIRATIONS.map((exp) => (
                  <button
                    key={exp.label}
                    onClick={() => setSelectedDuration(exp)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedDuration.seconds === exp.seconds
                        ? "bg-amber-500/20 border-amber-500 text-amber-400 font-black shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Order Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Position Capital ($ USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min="5"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-white text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Leverage Multiplier</label>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
                >
                  <option value={10}>10x Leverage</option>
                  <option value={50}>50x Leverage</option>
                  <option value={100}>100x Leverage (Standard)</option>
                  <option value={500}>500x Institutional Leverage</option>
                </select>
              </div>
            </div>

            {/* Insufficient Balance Indicator */}
            {user && user.balance < tradeAmount && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  Insufficient balance (${user.balance.toFixed(2)}). Deposit required to trade.
                </span>
                <button
                  onClick={() => setCurrentTab("wallet")}
                  className="px-3 py-1 rounded-xl gold-gradient text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer"
                >
                  Deposit <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Trade Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleStartTradePosition("BUY")}
                disabled={loading || !!activePosition}
                className={`py-4 rounded-2xl font-extrabold text-xs uppercase shadow-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                  activePosition
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                <span>Execute CALL (Buy Up)</span>
              </button>

              <button
                onClick={() => handleStartTradePosition("SELL")}
                disabled={loading || !!activePosition}
                className={`py-4 rounded-2xl font-extrabold text-xs uppercase shadow-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                  activePosition
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                }`}
              >
                <ArrowDown className="w-4 h-4" />
                <span>Execute PUT (Sell Down)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Executed Trade Orders History */}
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
                    <span className={`text-xs font-black font-mono ${
                      o.profitAmount >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {o.profitAmount >= 0 ? `+$${o.profitAmount}` : `-$${Math.abs(o.profitAmount)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
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
