import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { PriceAlert } from "@/types";
import {
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  Share2,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Check,
  ExternalLink,
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

const ALERT_ASSETS = [
  { symbol: "BTC/USD", name: "Bitcoin Index", basePrice: 68420 },
  { symbol: "ETH/USD", name: "Ethereum Spot", basePrice: 3540 },
  { symbol: "SOL/USD", name: "Solana Dex", basePrice: 178 },
  { symbol: "AAPL", name: "Apple Inc. Equity", basePrice: 224 },
  { symbol: "NVDA", name: "NVIDIA Corp Stock", basePrice: 128 },
  { symbol: "TSLA", name: "Tesla Inc Stock", basePrice: 215 },
];

export function ProfileView() {
  const { user, setUser, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"SETTINGS" | "PRICE_ALERTS">("SETTINGS");

  const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.lastName || user?.name?.split(" ")[1] || "");
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_PRESETS[0]);
  
  // Security Passwords
  const [txPassword, setTxPassword] = useState("");
  const [confirmTxPassword, setConfirmTxPassword] = useState("");

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Price Alerts State
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertSymbol, setAlertSymbol] = useState("BTC/USD");
  const [alertTarget, setAlertTarget] = useState<number>(68500);
  const [alertCondition, setAlertCondition] = useState<"ABOVE" | "BELOW">("ABOVE");

  useEffect(() => {
    fetchAlerts();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [token]);

  const fetchAlerts = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/user/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTarget || alertTarget <= 0) {
      toast.error("Please enter a valid target threshold price");
      return;
    }
    try {
      const res = await fetch("/api/user/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: alertSymbol,
          targetPrice: alertTarget,
          condition: alertCondition,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Price alert created for ${alertSymbol} at $${alertTarget}`);
        fetchAlerts();
      } else {
        toast.error(data.error || "Failed to create price alert");
      }
    } catch (err) {
      toast.error("Network error creating alert");
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/user/alerts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Alert deleted");
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      toast.error("Error deleting alert");
    }
  };

  const handleToggleAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/user/alerts/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
        );
      }
    } catch (e) {
      toast.error("Error toggling alert");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          displayName,
          phone,
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setMsg({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setMsg({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error updating profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetTxPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txPassword !== confirmTxPassword) {
      setMsg({ type: "error", text: "Transaction Security PINs do not match" });
      return;
    }
    if (txPassword.length < 4) {
      setMsg({ type: "error", text: "Transaction Security PIN must be at least 4 digits" });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/user/pin/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin: txPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user) setUser(data.user);
        setMsg({ type: "success", text: "Transaction Security PIN configured successfully!" });
        setTxPassword("");
        setConfirmTxPassword("");
      } else {
        setMsg({ type: "error", text: data.error || "Failed to set transaction PIN" });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error setting transaction PIN" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg gold-gradient text-slate-950 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {displayName || user?.name || "Investor Profile"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 border border-amber-500/40 px-3 py-1 text-[11px] font-mono font-bold text-amber-400">
                Account ID: <strong className="text-white">{user?.id}</strong>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                KYC: {user?.kycStatus}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                Ref Code: {user?.referralCode}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "SETTINGS"
                ? "bg-amber-600 text-slate-950 font-black shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserIcon className="w-4 h-4" /> Personal & Security
          </button>
          <button
            onClick={() => setActiveTab("PRICE_ALERTS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === "PRICE_ALERTS"
                ? "bg-amber-600 text-slate-950 font-black shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bell className="w-4 h-4" /> Price Alerts ({alerts.length})
          </button>
        </div>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-semibold ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {msg.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "PRICE_ALERTS" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Alert Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Bell className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Create Threshold Alert
              </h2>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Asset</label>
                <select
                  value={alertSymbol}
                  onChange={(e) => {
                    const sel = e.target.value;
                    setAlertSymbol(sel);
                    const found = ALERT_ASSETS.find((a) => a.symbol === sel);
                    if (found) setAlertTarget(found.basePrice);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                >
                  {ALERT_ASSETS.map((ast) => (
                    <option key={ast.symbol} value={ast.symbol}>
                      {ast.symbol} - {ast.name} (Live ~$${ast.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={alertTarget}
                  onChange={(e) => setAlertTarget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500/50"
                  placeholder="68500.00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Trigger Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertCondition("ABOVE")}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      alertCondition === "ABOVE"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    ▲ Price Goes Above
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertCondition("BELOW")}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      alertCondition === "BELOW"
                        ? "bg-rose-500/20 border-rose-500 text-rose-400 font-black"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    ▼ Price Goes Below
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full gold-gradient py-3 rounded-xl text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Price Alert
              </button>
            </form>
          </div>

          {/* Active Alerts List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Active Price Threshold Alerts ({alerts.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Live Listener Active
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 italic space-y-2">
                <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No price alerts created yet. Add an alert above to get instant browser and toast notifications when market targets are hit!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/40 text-amber-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{alt.symbol}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              alt.condition === "ABOVE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {alt.condition === "ABOVE" ? "▲ GOES ABOVE" : "▼ GOES BELOW"}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          Target: <strong className="text-amber-400">${alt.targetPrice.toLocaleString()}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAlert(alt.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          alt.active
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-900 text-slate-500 border border-slate-800"
                        }`}
                      >
                        {alt.active ? "Active" : "Paused"}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alt.id)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/50 transition cursor-pointer border border-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Original Personal & Security Settings Grid */
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <UserIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Personal Information
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {AVATAR_PRESETS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Preset"
                    onClick={() => setAvatarUrl(url)}
                    className={`h-11 w-11 rounded-xl object-cover cursor-pointer transition border-2 ${
                      avatarUrl === url ? "border-amber-400 scale-105" : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                placeholder="CryptoInvestor99"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                placeholder="+1 555-0192"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gold-gradient py-3 rounded-xl text-slate-950 font-extrabold text-xs uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
            >
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Security & Transaction Passwords */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Lock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Security & PIN Shield
            </h2>
          </div>

          <form onSubmit={handleSetTxPassword} className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Set a secret <strong className="text-amber-300">Transaction Password</strong> to authorize capital withdrawals and high-value transfers.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction Password</label>
              <input
                type="password"
                value={txPassword}
                onChange={(e) => setTxPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm Transaction Password</label>
              <input
                type="password"
                value={confirmTxPassword}
                onChange={(e) => setConfirmTxPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !txPassword}
              className="w-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 py-3 rounded-xl text-amber-300 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Update Transaction Password
            </button>
          </form>
        </div>
      </div>
      )}
    </div>
  );
}
