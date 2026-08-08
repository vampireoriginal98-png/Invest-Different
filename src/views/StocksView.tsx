import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { STOCKS_CATALOG, Stock } from "@/lib/stockEngine";
import { StockHolding } from "@/types";
import {
  TrendingUp,
  Landmark,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Activity,
  Zap,
  ShieldCheck,
  CandlestickChart,
  Clock,
  Layers,
  BarChart2,
  TrendingDown,
} from "lucide-react";
import { DepositModal } from "@/components/ui/DepositModal";
import toast from "react-hot-toast";

interface StockCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
}

const STOCK_TIMEFRAMES = [
  { label: "1D", intervalMs: 1500, name: "Daily Live" },
  { label: "1W", intervalMs: 3000, name: "Weekly Trend" },
  { label: "1M", intervalMs: 5000, name: "Monthly Channel" },
  { label: "1Y", intervalMs: 8000, name: "Yearly Performance" },
];

export function StocksView() {
  const { user, token, updateBalance } = useAuthStore();
  const [stocks, setStocks] = useState<Stock[]>(STOCKS_CATALOG);
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS_CATALOG[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(STOCK_TIMEFRAMES[0]);
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Independent Candlestick Charts per Stock Symbol
  const [stockCandleMap, setStockCandleMap] = useState<Record<string, StockCandle[]>>(() => {
    const init: Record<string, StockCandle[]> = {};
    STOCKS_CATALOG.forEach((stk) => {
      const base = stk.currentPrice;
      const candles: StockCandle[] = [];
      let current = base;

      for (let i = 20; i >= 1; i--) {
        const volatility = base * 0.004;
        const delta = (Math.random() - 0.48) * volatility;
        const open = Number(current.toFixed(2));
        const close = Number((current + delta).toFixed(2));
        const high = Number((Math.max(open, close) + Math.random() * (volatility * 0.7)).toFixed(2));
        const low = Number((Math.min(open, close) - Math.random() * (volatility * 0.7)).toFixed(2));

        candles.push({
          open,
          high,
          low,
          close,
          volume: Math.floor(Math.random() * 8000 + 1200),
          isUp: close >= open,
        });
        current = close;
      }
      init[stk.symbol] = candles;
    });
    return init;
  });

  // Live Spontaneous Price Ticks for Stock Catalog & Candlesticks
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((s) => {
          const deltaPercent = (Math.random() - 0.48) * 0.6;
          const openPrice = s.currentPrice;
          const newPrice = Number((openPrice * (1 + deltaPercent / 100)).toFixed(2));
          const newChange = Number((s.change24h + deltaPercent * 0.4).toFixed(2));
          const isUp = newPrice >= openPrice;
          const volatility = openPrice * 0.003;
          const high = Number((Math.max(openPrice, newPrice) + Math.random() * volatility).toFixed(2));
          const low = Number((Math.min(openPrice, newPrice) - Math.random() * volatility).toFixed(2));

          // Update Candlestick Chart array for this stock symbol
          setStockCandleMap((prevMap) => {
            const list = prevMap[s.symbol] || [];
            const newCandle: StockCandle = {
              open: openPrice,
              high,
              low,
              close: newPrice,
              volume: Math.floor(Math.random() * 12000 + 2000),
              isUp,
            };
            return {
              ...prevMap,
              [s.symbol]: [...list.slice(1), newCandle],
            };
          });

          return {
            ...s,
            currentPrice: newPrice,
            change24h: newChange,
          };
        })
      );
    }, selectedTimeframe.intervalMs);

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  // Sync selectedStock with ticking list
  useEffect(() => {
    const current = stocks.find((s) => s.symbol === selectedStock.symbol);
    if (current) setSelectedStock(current);
  }, [stocks]);

  useEffect(() => {
    fetchHoldings();
  }, [token]);

  const fetchHoldings = async () => {
    try {
      const res = await fetch("/api/stocks/holdings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setHoldings(data.holdings || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyStock = async () => {
    if (!user) return;
    if (investAmount < selectedStock.minInvestment) {
      toast.error(`Minimum investment for ${selectedStock.symbol} is $${selectedStock.minInvestment}`);
      return;
    }
    if (user.balance < investAmount) {
      setShowDepositModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stocks/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          investedAmount: investAmount,
          durationDays,
          currentPrice: selectedStock.currentPrice,
          expectedProfitPercent: selectedStock.projectedAnnualReturn * (durationDays / 365),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to purchase stock shares");

      toast.success(`📈 Purchased $${investAmount} in ${selectedStock.symbol}!`);
      updateBalance(data.newBalance);
      fetchHoldings();
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase stock");
    } finally {
      setLoading(false);
    }
  };

  const currentStockCandles = stockCandleMap[selectedStock.symbol] || [];
  const projectedPayout = Number(
    (investAmount * (1 + (selectedStock.projectedAnnualReturn * (durationDays / 365)) / 100)).toFixed(2)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        requiredAmount={investAmount}
        featureName={`${selectedStock.name} (${selectedStock.symbol}) Shares`}
      />

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-blue-500/30 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Landmark className="w-4 h-4" />
              <span>LIVE NASDAQ / S&P 500 EQUITY PORTFOLIOS</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Stock & ETF Capital Holdings
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Acquire verified portfolio allocations in top global equities (AAPL, NVDA, TSLA, MSFT, GOOGL, META, SPY, QQQ, GOLD, BTC Trust) with live Candlestick charts and zero gas friction.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Live Stock Market Feed</p>
              <p className="text-xs font-black text-emerald-400">10 EQUITY MARKETS LIVE</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Stock Catalog, Interactive Candlestick Chart & Buy Widget */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Active Global Markets</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stocks.map((stk) => {
              const isSelected = selectedStock.symbol === stk.symbol;
              return (
                <div
                  key={stk.symbol}
                  onClick={() => {
                    setSelectedStock(stk);
                    setInvestAmount(stk.minInvestment);
                  }}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.01]"
                      : "bg-slate-900/80 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-black text-white">{stk.symbol}</span>
                      <p className="text-xs text-slate-400">{stk.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-extrabold text-white font-mono">${stk.currentPrice.toFixed(2)}</p>
                      <span
                        className={`text-xs font-bold inline-flex items-center gap-0.5 ${
                          stk.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {stk.change24h >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {stk.change24h > 0 ? `+${stk.change24h}` : stk.change24h}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-medium">Min Entry</span>
                    <span className="font-bold text-amber-400">${stk.minInvestment}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Real-Time Equity Candlestick Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CandlestickChart className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-black text-white">{selectedStock.name} ({selectedStock.symbol}) Live Candlestick Chart</h3>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Live Price: <strong className="text-amber-400">${selectedStock.currentPrice.toFixed(2)}</strong> | 24h Trend:{" "}
                  <strong className={selectedStock.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {selectedStock.change24h > 0 ? `+${selectedStock.change24h}` : selectedStock.change24h}%
                  </strong>
                </p>
              </div>

              {/* Timeframe Selectors */}
              <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[11px] font-bold">
                {STOCK_TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.label}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      selectedTimeframe.label === tf.label
                        ? "gold-gradient text-slate-950 font-black shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Candlestick Display */}
            <div className="h-64 w-full bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between">
              {(() => {
                if (currentStockCandles.length === 0) return null;
                const lows = currentStockCandles.map((c) => c.low);
                const highs = currentStockCandles.map((c) => c.high);
                const minP = Math.min(...lows) * 0.998;
                const maxP = Math.max(...highs) * 1.002;
                const pRange = maxP - minP || 1;
                const chartH = 190;

                return (
                  <div className="relative w-full h-[190px]">
                    {[0, 0.33, 0.66, 1].map((ratio, i) => {
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

                    <svg className="w-full h-full overflow-visible">
                      {currentStockCandles.map((c, idx) => {
                        const totalCandles = currentStockCandles.length;
                        const pctX = ((idx + 0.5) / totalCandles) * 100;
                        const yHigh = chartH - ((c.high - minP) / pRange) * chartH;
                        const yLow = chartH - ((c.low - minP) / pRange) * chartH;
                        const yOpen = chartH - ((c.open - minP) / pRange) * chartH;
                        const yClose = chartH - ((c.close - minP) / pRange) * chartH;

                        const color = c.isUp ? "#10b981" : "#f43f5e";
                        const yTop = Math.min(yOpen, yClose);
                        const bodyH = Math.max(3, Math.abs(yClose - yOpen));

                        return (
                          <g key={idx}>
                            <line
                              x1={`${pctX}%`}
                              y1={yHigh}
                              x2={`${pctX}%`}
                              y2={yLow}
                              stroke={color}
                              strokeWidth={1.5}
                            />
                            <rect
                              x={`calc(${pctX}% - 6px)`}
                              y={yTop}
                              width={12}
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

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2">
                <span>RSI: 58.4 (Bullish)</span>
                <span>Vol: 1.42M Shares</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME CANDLE FEED ({selectedTimeframe.name})
                </span>
              </div>
            </div>

            {/* Buy Execution Widget */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-black text-white uppercase">Acquire {selectedStock.name} Shares</h4>
                  <p className="text-xs text-slate-400">Sector: {selectedStock.sector} | Execution Gas: <strong className="text-emerald-400">$0.00 FREE</strong></p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
                  Proj. Annual Yield: +{selectedStock.projectedAnnualReturn}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Capital Investment Amount ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      min={selectedStock.minInvestment}
                      value={investAmount}
                      onChange={(e) => setInvestAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Minimum required capital: ${selectedStock.minInvestment}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Portfolio Holding Term
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
                  >
                    {selectedStock.durationsDays.map((d) => (
                      <option key={d} value={d}>
                        {d < 365 ? `${d} Days` : `${d / 365} Year${d > 365 ? "s" : ""}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Expected Maturity Payout</p>
                  <p className="text-2xl font-black text-emerald-400">${projectedPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <button
                  onClick={handleBuyStock}
                  disabled={loading}
                  className="gold-gradient text-slate-950 font-black py-3.5 px-8 rounded-xl text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 cursor-pointer transition uppercase"
                >
                  {loading ? "Processing Order..." : `Acquire $${investAmount} Allocation`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Holdings */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>Your Active Stock Holdings</span>
          </h2>

          <div className="space-y-4">
            {holdings.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-sm">
                No active stock holdings yet. Select a market and purchase shares to build your portfolio.
              </div>
            ) : (
              holdings.map((h) => (
                <div key={h.id} className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-white">{h.symbol}</span>
                      <span className="text-xs text-slate-400 ml-2">({h.shares} shares)</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE HOLDING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80 font-mono">
                    <div>
                      <span className="text-slate-400">Capital Invested</span>
                      <p className="font-bold text-white">${h.investedAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Expected Payout</span>
                      <p className="font-bold text-emerald-400">${h.projectedPayout.toFixed(2)}</p>
                    </div>
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
