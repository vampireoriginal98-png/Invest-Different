import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { SpinReward } from "@/types";
import { Dices, DollarSign, Trophy, Sparkles, Zap, Award, Gift, ShieldCheck, HelpCircle, CheckCircle2 } from "lucide-react";
import { DepositModal } from "@/components/ui/DepositModal";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

interface WheelReward extends SpinReward {
  color: string;
}

const REWARDS_POOL: WheelReward[] = [
  { id: "rw_1", label: "$50.00 Mega Cash", value: 50, type: "CASH", weight: 8, color: "#10b981" },
  { id: "rw_2", label: "🎰 $10,000 Grand Prize", value: 10000, type: "GRAND", weight: 1, color: "#f59e0b" },
  { id: "rw_3", label: "$25.00 Instant Cash", value: 25, type: "CASH", weight: 12, color: "#3b82f6" },
  { id: "rw_4", label: "🛡️ Level 4 Aegis Shield", value: 0, type: "INSURANCE", weight: 4, color: "#8b5cf6" },
  { id: "rw_5", label: "$10.00 Quick Cash", value: 10, type: "CASH", weight: 20, color: "#06b6d4" },
  { id: "rw_6", label: "$5.20 Bonus Cash", value: 5.2, type: "CASH", weight: 25, color: "#ec4899" },
  { id: "rw_7", label: "$1.50 Pocket Cash", value: 1.5, type: "CASH", weight: 30, color: "#64748b" },
  { id: "rw_8", label: "💎 $70,000 Mega Fortune", value: 70000, type: "MEGA", weight: 0.5, color: "#eab308" },
];

export function SpinWheelView() {
  const { user, token, updateBalance, setUser } = useAuthStore();
  const [betAmount, setBetAmount] = useState<number>(20);
  const [spinning, setSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState<number>(0);
  const [recentWin, setRecentWin] = useState<WheelReward | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const isFreeAvailable = user?.lastFreeSpinDate !== todayStr;

  const numSegments = REWARDS_POOL.length;
  const segmentAngle = 360 / numSegments;

  const handleSpin = async (isFree = false) => {
    if (!user) return;

    if (!isFree) {
      if (betAmount < 2) {
        toast.error("Minimum spin bet is $2");
        return;
      }
      if (user.balance < betAmount) {
        setShowDepositModal(true);
        return;
      }
    }

    setSpinning(true);
    setRecentWin(null);

    // Determine reward weighted by bet higher amount coefficient
    const weightBoost = isFree ? 1 : Math.min(3, Math.max(1, betAmount / 20));
    const rand = Math.random() * 100;

    let targetIndex = 6; // default $1.50
    if (rand < 1 * weightBoost) targetIndex = 1; // $10k Grand
    else if (rand < 1.5 * weightBoost) targetIndex = 7; // $70k Mega
    else if (rand < 5 * weightBoost) targetIndex = 3; // Aegis Shield
    else if (rand < 15 * weightBoost) targetIndex = 0; // $50 Cash
    else if (rand < 30 * weightBoost) targetIndex = 2; // $25 Cash
    else if (rand < 50 * weightBoost) targetIndex = 4; // $10 Cash
    else if (rand < 75 * weightBoost) targetIndex = 5; // $5.20 Cash

    const selectedReward = REWARDS_POOL[targetIndex];

    // Calculate rotation angle to auto-stop cleanly on the selected reward segment
    // Top indicator point is at 270 degrees (or 90deg offset)
    const extraRotations = 5 * 360; // 5 full spins
    const targetSegmentOffset = targetIndex * segmentAngle + segmentAngle / 2;
    const finalDegree = rotationDegree + extraRotations + (360 - targetSegmentOffset);

    setRotationDegree(finalDegree);

    setTimeout(async () => {
      try {
        const res = await fetch("/api/games/spin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            betAmount: isFree ? 0 : betAmount,
            rewardWon: selectedReward,
            isFreeSpin: isFree,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Spin failed");

        setRecentWin(selectedReward);
        confetti({ particleCount: 90, spread: 70 });
        toast.success(`🎉 WON: ${selectedReward.label}!`);
        updateBalance(data.newBalance);
        if (data.user) setUser(data.user);
      } catch (err: any) {
        toast.error(err.message || "Spin error");
      } finally {
        setSpinning(false);
      }
    }, 4000); // 4-second realistic physical wheel spin & deceleration
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        requiredAmount={betAmount}
        featureName="Paid Fortune Wheel Spin"
      />

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-8 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Dices className="w-4 h-4" />
          <span>INSTITUTIONAL FORTUNE WHEEL & REWARD ENGINE</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Spin & Win Real Cash Prizes
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto mt-1">
          Spin the physical wheel automatically to win instant cash ($1.50 to $50.00), Aegis level 4 shields, or up to $70,000 Mega Fortune payouts!
        </p>
      </div>

      {/* VIP Higher Bet Tip Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
        <div>
          <span className="text-white font-extrabold uppercase tracking-wide">💡 Pro Investor Tip:</span>{" "}
          Spinning with higher bet sizes ($20, $50, $100, $500+) boosts your probability coefficient and unlocks higher odds of winning top $50.00 Cash, Level 4 Aegis Shield, or $70,000 Mega Fortune rewards!
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Physical Wheel & Spin Controls */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
          {/* Wheel Pointer */}
          <div className="relative max-w-xs sm:max-w-sm mx-auto pt-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)]" />

            {/* Rotating SVG Wheel */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-full border-8 border-amber-500/50 shadow-2xl shadow-amber-500/20 bg-slate-950 overflow-hidden">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transition-transform duration-[4000ms] ease-out"
                style={{ transform: `rotate(${rotationDegree}deg)` }}
              >
                {REWARDS_POOL.map((rw, i) => {
                  const startAngle = i * segmentAngle;
                  const endAngle = (i + 1) * segmentAngle;
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                  const largeArc = segmentAngle > 180 ? 1 : 0;
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  return (
                    <g key={rw.id}>
                      <path d={pathData} fill={rw.color} opacity={0.85} stroke="#0f172a" strokeWidth={1} />
                      <text
                        x={50 + 32 * Math.cos((Math.PI * (startAngle + segmentAngle / 2)) / 180)}
                        y={50 + 32 * Math.sin((Math.PI * (startAngle + segmentAngle / 2)) / 180)}
                        fill="#ffffff"
                        fontSize="3.5"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${startAngle + segmentAngle / 2 + 90}, ${
                          50 + 32 * Math.cos((Math.PI * (startAngle + segmentAngle / 2)) / 180)
                        }, ${50 + 32 * Math.sin((Math.PI * (startAngle + segmentAngle / 2)) / 180)})`}
                      >
                        {rw.value > 0 ? `$${rw.value}` : "SHIELD"}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Center Wheel Hub */}
              <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center shadow-xl z-10">
                <Dices className={`w-7 h-7 text-amber-400 ${spinning ? "animate-spin" : ""}`} />
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-white">
              {spinning ? "SPINNING & COMPUTING WINNER..." : recentWin ? `RESULT: ${recentWin.label}` : "SELECT BET & SPIN"}
            </h3>
            <p className="text-xs text-slate-400">
              {spinning ? "Physical wheel auto-stopping on your calculated prize..." : "Wheel automatically decelerates and brings exact prize into alignment."}
            </p>
          </div>

          {/* Free Spin Available Banner */}
          {isFreeAvailable ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-left">
                <Gift className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-white font-extrabold text-sm">Daily Free Spin Available!</p>
                  <p className="text-slate-400 font-normal">Spin for 100% FREE without deducting any wallet funds.</p>
                </div>
              </div>

              <button
                onClick={() => handleSpin(true)}
                disabled={spinning}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase shadow-lg transition cursor-pointer shrink-0"
              >
                {spinning ? "Spinning..." : "Claim $0 Free Spin"}
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-medium">
              ✅ Today's Daily Free Spin claimed! Your next $0 free instance resets tomorrow.
            </div>
          )}

          {/* Paid Spin Bet Control */}
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <label className="block text-xs font-bold text-slate-400 uppercase">
              Paid Spin Bet Amount ($ USD)
            </label>
            <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
              {[10, 20, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    betAmount === amt
                      ? "gold-gradient text-slate-950 font-black"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="relative max-w-md mx-auto">
              <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min="2"
                max="1000"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-bold text-center focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => handleSpin(false)}
              disabled={spinning}
              className="w-full max-w-md gold-gradient text-slate-950 font-black py-4 rounded-2xl text-base shadow-xl shadow-amber-500/20 hover:brightness-110 cursor-pointer transition uppercase"
            >
              {spinning ? "Spinning Wheel..." : `SPIN WHEEL WITH $${betAmount} WALLET BALANCE`}
            </button>
          </div>
        </div>

        {/* Possible Rewards Catalog Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Possible Rewards Catalog</span>
          </h2>

          <div className="space-y-3">
            {REWARDS_POOL.map((rw) => (
              <div
                key={rw.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: rw.color }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{rw.label}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Type: {rw.type} | Value: {rw.value > 0 ? `$${rw.value.toLocaleString()}` : "Shield Asset"}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-amber-400">
                  {rw.weight >= 10 ? "HIGH ODDS" : rw.weight >= 4 ? "MEDIUM" : "JACKPOT"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
