import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { STOCKS_CATALOG, Stock } from "@/lib/stockEngine";
import { StockHolding } from "@/types";
import { TrendingUp, Clock, Landmark, DollarSign, ArrowUpRight, ArrowDownRight, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

export function StocksView() {
  const { user, token, updateBalance } = useAuthStore();
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS_CATALOG[0]);
  const [investAmount, setInvestAmount] = useState<number>(500);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(false);

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
      toast.error(`Insufficient balance. Requires $${investAmount}`);
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

  const projectedPayout = Number(
    (investAmount * (1 + (selectedStock.projectedAnnualReturn * (durationDays / 365)) / 100)).toFixed(2)
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Landmark className="w-4 h-4" />
              <span>GLOBAL EQUITY & INDEX PORTFOLIOS</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Stock & ETF Capital Holdings
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Buy real simulated shares in top global tech, index ETFs, and crypto trusts. Guaranteed auto-redemption upon duration maturity.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Stock Catalog & Buy Widget */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Available Markets</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STOCKS_CATALOG.map((stk) => {
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
                      ? "bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 border-blue-500/80 shadow-lg shadow-blue-500/10"
                      : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-lg font-black text-white">{stk.symbol}</span>
                      <p className="text-xs text-slate-400">{stk.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-white">${stk.currentPrice.toFixed(2)}</p>
                      <span
                        className={`text-xs font-bold inline-flex items-center gap-0.5 ${
                          stk.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {stk.change24h >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {stk.change24h}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                    <span className="text-slate-400">Min Capital</span>
                    <span className="font-bold text-amber-400">${stk.minInvestment}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Buy Execution Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Invest in {selectedStock.name} ({selectedStock.symbol})</h3>
                <p className="text-xs text-slate-400">Sector: {selectedStock.sector}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Proj. Annual: {selectedStock.projectedAnnualReturn}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  Investment Capital ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min={selectedStock.minInvestment}
                    value={investAmount}
                    onChange={(e) => setInvestAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Min investment: ${selectedStock.minInvestment}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  Hold Duration
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {selectedStock.durationsDays.map((d) => (
                    <option key={d} value={d}>
                      {d < 365 ? `${d} Days` : `${d / 365} Year${d > 365 ? "s" : ""}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between text-sm">
              <div>
                <p className="text-xs text-slate-400">Projected Maturity Payout</p>
                <p className="text-xl font-black text-emerald-400">${projectedPayout.toFixed(2)}</p>
              </div>
              <button
                onClick={handleBuyStock}
                disabled={loading}
                className="gold-gradient text-slate-950 font-black py-3 px-6 rounded-xl text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 cursor-pointer"
              >
                {loading ? "Processing..." : `Confirm $${investAmount} Investment`}
              </button>
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
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No active stock holdings yet. Select a market and purchase shares to build your portfolio.
              </div>
            ) : (
              holdings.map((h) => (
                <div key={h.id} className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-white">{h.symbol}</span>
                      <span className="text-xs text-slate-400 ml-2">({h.shares} shares)</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      HOLDING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400">Invested Capital</span>
                      <p className="font-bold text-white">${h.investedAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Projected Return</span>
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
