import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { getGasFee } from "@/lib/gasFee";
import { Withdrawal } from "@/types";
import { ArrowUpRight, ShieldAlert, Zap, Clock, DollarSign, Wallet, Lock, KeyRound, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function WithdrawalsView() {
  const { user, token, setUser, setCurrentTab } = useAuthStore();
  const [isReferralWithdrawal, setIsReferralWithdrawal] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [payoutAddress, setPayoutAddress] = useState("");
  const [cryptoAsset, setCryptoAsset] = useState("USDT (TRC20)");
  const [pin, setPin] = useState("");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [gasFeeData, setGasFeeData] = useState(getGasFee());
  const [loading, setLoading] = useState(false);

  // Set default min based on type
  useEffect(() => {
    if (isReferralWithdrawal) {
      setAmount(500);
    } else {
      setAmount(1000);
    }
  }, [isReferralWithdrawal]);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(() => {
      setGasFeeData(getGasFee());
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/withdrawal/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setWithdrawals(data.withdrawals || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (user.kycStatus !== "APPROVED") {
      toast.error("Mandatory KYC Identity Verification required! Admin must approve your KYC before withdrawals are unlocked.");
      setCurrentTab("kyc");
      return;
    }

    if (!user.transactionPasswordSet) {
      toast.error("Transaction Security PIN required. Please configure your 4-digit PIN first.");
      setCurrentTab("profile");
      return;
    }

    if (!pin || pin.length < 4) {
      toast.error("Please enter your 4-digit Transaction Security PIN");
      return;
    }

    if (!payoutAddress) {
      toast.error("Please enter a valid payout wallet address");
      return;
    }

    const minRequired = isReferralWithdrawal ? 500 : 1000;
    if (amount < minRequired) {
      toast.error(`Minimum withdrawal amount for ${isReferralWithdrawal ? "Referral Earnings" : "Trading Profits & Capital"} is $${minRequired}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/withdrawal/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          payoutAddress,
          cryptoAsset,
          pin,
          isReferralWithdrawal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal request failed");

      toast.success("✅ Withdrawal request submitted successfully! Admin review pending.");
      if (data.user) setUser(data.user);
      setPayoutAddress("");
      setPin("");
      fetchHistory();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const netPayout = Math.max(0, amount - gasFeeData.fee);
  const minRequired = isReferralWithdrawal ? 500 : 1000;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
              <Zap className="w-4 h-4" />
              <span>DYNAMIC GAS SHIELDED WITHDRAWALS</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Withdraw Capital & Profits
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mt-1">
              Request express blockchain payouts. Minimum balance required: <span className="text-amber-400 font-bold">$1,000</span> for trading capital/profits or <span className="text-amber-400 font-bold">$500</span> for referral earnings.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 shrink-0 flex items-center gap-4">
            <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold">Network Gas Fee (3m Cycle)</p>
              <p className="text-lg font-black text-amber-400">${gasFeeData.fee.toFixed(2)} USDT</p>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Warning Banner if not approved */}
      {user?.kycStatus !== "APPROVED" && (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-950/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Identity Verification (KYC) Compulsory</h4>
              <p className="text-xs text-amber-200/90 font-medium">
                Your account KYC status is currently <span className="font-black text-amber-400 uppercase">{user?.kycStatus || "PENDING"}</span>. KYC approval by compliance is mandatory to enable crypto payouts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab("kyc")}
            className="gold-gradient text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 transition shrink-0 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Verify ID Now
          </button>
        </div>
      )}

      {/* PIN Warning Banner if PIN not set */}
      {!user?.transactionPasswordSet && (
        <div className="rounded-2xl border border-indigo-500/50 bg-indigo-950/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">4-Digit Transaction Security PIN Required</h4>
              <p className="text-xs text-slate-300">
                Protect your account. You must set a 4-digit Security PIN in your Profile settings before submitting payout requests.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab("profile")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 cursor-pointer"
          >
            Set Security PIN
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Request Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleRequestWithdrawal} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-bold text-white">Withdrawal Terminal</h2>

              {/* Pool Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReferralWithdrawal(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    !isReferralWithdrawal
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Trading Profits & Capital (${user?.balance?.toLocaleString() || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setIsReferralWithdrawal(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isReferralWithdrawal
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Referral Commissions (${(user?.referralEarnings || 0).toLocaleString()})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Withdrawal Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min={minRequired}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-amber-400 font-semibold mt-1">
                  Mandatory minimum: ${minRequired.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Crypto Asset</label>
                <select
                  value={cryptoAsset}
                  onChange={(e) => setCryptoAsset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="USDT (TRC20)">USDT (TRC20)</option>
                  <option value="USDT (ERC20)">USDT (ERC20)</option>
                  <option value="BTC (Bitcoin Network)">BTC (Bitcoin Network)</option>
                  <option value="ETH (Ethereum Mainnet)">ETH (Ethereum Mainnet)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Destination Payout Address</label>
                <div className="relative">
                  <Wallet className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. 0x71C7656... or TXYZ..."
                    value={payoutAddress}
                    onChange={(e) => setPayoutAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">4-Digit Security PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter Security PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between text-sm">
              <div>
                <p className="text-xs text-slate-400">Net Estimated Payout</p>
                <p className="text-xl font-black text-emerald-400">${netPayout.toFixed(2)} USDT</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="gold-gradient text-slate-950 font-black py-3 px-6 rounded-xl text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 cursor-pointer"
              >
                {loading ? "Transmitting..." : "Confirm & Submit Withdrawal"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: History */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Withdrawal History</span>
          </h2>

          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No past withdrawal requests.
              </div>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">${w.amount.toFixed(2)}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        w.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : w.status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate">{w.payoutAddress}</p>
                  <p className="text-[10px] text-slate-500">{new Date(w.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
