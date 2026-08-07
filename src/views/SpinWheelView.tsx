import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { SpinReward } from "@/types";
import { Dices, DollarSign, Trophy, Sparkles, Zap, Award } from "lucide-react";
import toast from "react-hot-toast";

const REWARDS_POOL: SpinReward[] = [
  { id: "rw_1", label: "🎰 $10,000 Grand Prize", value: 10000, type: "GRAND", weight: 1 },
  { id: "rw_2", label: "💎 $70,000 Mega Fortune", value: 70000, type: "MEGA", weight: 1 },
  { id: "rw_3", label: "🛡️ Level 4 Aegis Shield", value: 0, type: "INSURANCE", weight: 2 },
  { id: "rw_4", label: "💰 $25.00 Instant Cash", value: 25, type: "CASH", weight: 10 },
  { id: "rw_5", label: "💰 $5.20 Bonus Cash", value: 5.2, type: "CASH", weight: 25 },
  { id: "rw_6", label: "💰 $1.50 Pocket Cash", value: 1.5, type: "CASH", weight: 50 },
];

export function SpinWheelView() {
  const { user, token, updateBalance } = useAuthStore();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [spinning, setSpinning] = useState(false);
  const [recentWin, setRecentWin] = useState<SpinReward | null>(null);

  const handleSpin = async () => {
    if (!user) return;
    if (betAmount < 2) {
      toast.error("Minimum spin bet is $2");
      return;
    }
    if (user.balance < betAmount) {
      toast.error(`Insufficient balance. Requires $${betAmount}`);
      return;
    }

    setSpinning(true);
    setRecentWin(null);

    // Pick weighted reward
    const rand = Math.random() * 100;
    let selectedReward = REWARDS_POOL[5]; // default low
    if (rand < 2) selectedReward = REWARDS_POOL[0]; // Grand
    else if (rand < 3) selectedReward = REWARDS_POOL[1]; // Mega
    else if (rand < 8) selectedReward = REWARDS_POOL[2]; // Insurance
    else if (rand < 25) selectedReward = REWARDS_POOL[3]; // $25
    else if (rand < 55) selectedReward = REWARDS_POOL[4]; // $5.20

    setTimeout(async () => {
      try {
        const res = await fetch("/api/games/spin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ betAmount, rewardWon: selectedReward }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Spin failed");

        setRecentWin(selectedReward);
        toast.success(`🎉 WON: ${selectedReward.label}!`);
        updateBalance(data.newBalance);
      } catch (err: any) {
        toast.error(err.message || "Spin error");
      } finally {
        setSpinning(false);
      }
    }, 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-8 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Dices className="w-4 h-4" />
          <span>FORTUNE WHEEL & REWARD MATRIX</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Spin the Fortune Wheel
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-1">
          Select your bet amount ($2 to $1,000) and spin to unlock instant cash rewards, Aegis insurance upgrades, or the $70,000 Mega Fortune.
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto text-center space-y-8 shadow-2xl">
        {/* Animated Visual Box */}
        <div className="relative h-64 w-64 mx-auto rounded-full border-8 border-amber-500/40 bg-slate-950 flex flex-col items-center justify-center p-6 shadow-2xl shadow-amber-500/20">
          <div className={`transition-all duration-700 ${spinning ? "animate-spin" : ""}`}>
            <Sparkles className="w-16 h-16 text-amber-400" />
          </div>
          <p className="text-xs font-bold text-slate-400 mt-2">
            {spinning ? "SPINNING MATRIX..." : recentWin ? recentWin.label : "READY TO SPIN"}
          </p>
        </div>

        {/* Bet Selection */}
        <div className="max-w-md mx-auto space-y-4">
          <label className="block text-xs font-bold text-slate-400 uppercase">Select Bet Amount ($)</label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  betAmount === amt
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>

          <div className="relative pt-2">
            <DollarSign className="absolute left-3.5 top-5 w-4 h-4 text-slate-500" />
            <input
              type="number"
              min="2"
              max="1000"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-bold text-center focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className="w-full max-w-md gold-gradient text-slate-950 font-black py-4 rounded-2xl text-base shadow-xl shadow-amber-500/20 hover:brightness-110 cursor-pointer"
        >
          {spinning ? "Spinning..." : `SPIN WHEEL FOR $${betAmount}`}
        </button>
      </div>
    </div>
  );
}
