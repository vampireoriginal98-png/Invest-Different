import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  BarChart3,
  Users,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Bell,
  Settings,
  Share2,
  MessageSquare,
  FileText,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit3,
  KeyRound,
  Eye,
  Lock,
  Plus,
} from "lucide-react";
import { DepositQueue } from "@/components/admin/DepositQueue";
import { WithdrawalQueue } from "@/components/admin/WithdrawalQueue";
import { KYCQueue } from "@/components/admin/KYCQueue";
import { UserTable } from "@/components/admin/UserTable";
import { NotificationSender } from "@/components/admin/NotificationSender";
import { SocialLinksQueue } from "@/components/admin/SocialLinksQueue";
import { formatCurrency } from "@/lib/utils";

export function AdminView() {
  const { user, setCurrentTab, setSystemSetting, fetchSettings: refreshStoreSettings } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "deposits" | "withdrawals" | "kyc" | "users" | "socials" | "messages" | "content" | "settings"
  >("overview");
  const [previewAsUser, setPreviewAsUser] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingKyc: 0,
    totalDeposited: 0,
  });

  const [settings, setSettings] = useState({
    cryptoAddress: "",
    usdtAddress: "",
    btcAddress: "",
    ethAddress: "",
    usdtQrCode: "",
    btcQrCode: "",
    ethQrCode: "",
    minDeposit: 10,
    minWithdrawal: 50,
    announcement: "",
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Direct Message State
  const [targetUserId, setTargetUserId] = useState("");
  const [directMsg, setDirectMsg] = useState("");

  // Admin Credentials Change
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  useEffect(() => {
    fetchStats();
    fetchAdminSettings();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Fetch admin stats error:", e);
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (e) {
      console.error("Fetch admin settings error:", e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);

    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMsg("System wallet addresses, QR codes & limits updated!");
        setSystemSetting(settings);
        refreshStoreSettings();
        fetchAdminSettings();
      } else {
        setMsg("Failed to save settings");
      }
    } catch (e) {
      setMsg("Error saving settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendDirectMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !directMsg) return;

    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId,
          message: directMsg,
          type: "ADMIN",
        }),
      });

      if (res.ok) {
        setMsg("Direct message delivered to user inbox!");
        setDirectMsg("");
      }
    } catch (e) {
      console.error("Direct msg error:", e);
    }
  };

  const handleChangeAdminCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) return;

    try {
      const token = localStorage.getItem("invest_token");
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newAdminEmail || undefined,
          password: newAdminPassword,
        }),
      });

      if (res.ok) {
        setMsg("Admin security credentials updated successfully!");
        setNewAdminPassword("");
      }
    } catch (e) {
      setMsg("Error updating admin credentials");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 py-4">
      {/* Admin Header */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
              Admin SuperControl Center
            </h1>
            <p className="text-xs text-slate-400">
              Logged in as <strong className="text-emerald-300">{user?.email}</strong> ({user?.role})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!previewAsUser) {
                setPreviewAsUser(true);
                setCurrentTab("dashboard");
              } else {
                setPreviewAsUser(false);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              previewAsUser
                ? "bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20"
                : "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{previewAsUser ? "Exit User Preview" : "Preview User Mode"}</span>
          </button>

          <button
            onClick={fetchStats}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
          >
            Refresh Queue Stats
          </button>
        </div>
      </div>

      {previewAsUser && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>Admin Draft/Preview Mode Enabled. You are viewing the live platform experience as an investor.</span>
          </div>
          <button onClick={() => setPreviewAsUser(false)} className="text-amber-400 hover:underline font-bold">
            Exit Preview Mode
          </button>
        </div>
      )}

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, color: "text-amber-400" },
          { label: "Pending Deposits", value: stats.pendingDeposits, color: "text-amber-300" },
          { label: "Pending Withdrawals", value: stats.pendingWithdrawals, color: "text-rose-400" },
          { label: "Pending KYC", value: stats.pendingKyc, color: "text-blue-400" },
          { label: "Total Confirmed Deposits", value: formatCurrency(stats.totalDeposited), color: "text-emerald-400" },
        ].map((s, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Admin Horizontal Navigation & Fast Dropdown Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center justify-between w-full lg:w-auto gap-3 shrink-0">
          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest shrink-0 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            SuperControl Nav:
          </span>

          {/* Quick Dynamic Dropdown Select for Fast Jumping on all devices */}
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-emerald-300 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[200px] sm:max-w-none"
          >
            <option value="overview">📊 Overview & Broadcast</option>
            <option value="deposits">💰 Deposits Queue ({stats.pendingDeposits})</option>
            <option value="withdrawals">💸 Withdrawals Queue ({stats.pendingWithdrawals})</option>
            <option value="kyc">📋 KYC Approvals ({stats.pendingKyc})</option>
            <option value="socials">📱 Social Link Verification</option>
            <option value="users">👥 User Database</option>
            <option value="messages">💬 Direct User Messages</option>
            <option value="settings">⚙️ System Wallet & Settings</option>
          </select>
        </div>

        {/* Scrollable Horizontal Tabs with Custom Visible Scrollbar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-slate-950 py-2 w-full max-w-full">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "deposits", label: `Deposits (${stats.pendingDeposits})`, icon: Wallet, alert: stats.pendingDeposits > 0 },
            { id: "withdrawals", label: `Withdrawals (${stats.pendingWithdrawals})`, icon: ArrowUpRight, alert: stats.pendingWithdrawals > 0 },
            { id: "kyc", label: `KYC Review (${stats.pendingKyc})`, icon: ShieldCheck, alert: stats.pendingKyc > 0 },
            { id: "socials", label: "Social Verifications", icon: Share2 },
            { id: "users", label: "User Database", icon: Users },
            { id: "messages", label: "Direct Messages", icon: MessageSquare },
            { id: "settings", label: "Wallet & System", icon: Settings },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === t.id
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10 font-extrabold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-950 border border-transparent"
              }`}
            >
              <t.icon className={`w-3.5 h-3.5 ${activeTab === t.id ? "text-emerald-400" : "text-slate-500"}`} />
              <span>{t.label}</span>
              {t.alert && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              Broadcast Notification Sender
            </h2>
            <NotificationSender />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Change Admin Security Credentials
            </h2>

            <form onSubmit={handleChangeAdminCreds} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">New Admin Email (Optional)</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Admin@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">New Admin Password</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Admin123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-500/30 transition cursor-pointer"
              >
                Update Admin Password
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "deposits" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <DepositQueue />
        </div>
      )}

      {activeTab === "withdrawals" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <WithdrawalQueue />
        </div>
      )}

      {activeTab === "kyc" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <KYCQueue />
        </div>
      )}

      {activeTab === "socials" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <SocialLinksQueue />
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <UserTable />
        </div>
      )}

      {activeTab === "messages" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl space-y-4">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Send Direct Message to Individual User Inbox
          </h2>

          <form onSubmit={handleSendDirectMsg} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target User ID or Email</label>
              <input
                type="text"
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="usr_demo_002 or user@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Message Content</label>
              <textarea
                rows={3}
                required
                value={directMsg}
                onChange={(e) => setDirectMsg(e.target.value)}
                placeholder="Your $1,000 USDT deposit was confirmed..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 py-3 rounded-xl font-bold text-xs uppercase hover:bg-emerald-500/30 transition cursor-pointer"
            >
              Dispatch Direct Alert
            </button>
          </form>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl space-y-6">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            System Wallet Configuration & Deposit Barcode QR Codes
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* USDT Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">USDT Deposit Config</h3>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">USDT Wallet Address (TRC20/ERC20)</label>
                <input
                  type="text"
                  value={settings.cryptoAddress || settings.usdtAddress}
                  onChange={(e) => setSettings({ ...settings, cryptoAddress: e.target.value, usdtAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">USDT Barcode QR Code Image URL (Optional - leaves blank to auto-generate QR)</label>
                <input
                  type="text"
                  value={settings.usdtQrCode || ""}
                  onChange={(e) => setSettings({ ...settings, usdtQrCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono"
                  placeholder="https://... or data:image/png;base64,..."
                />
              </div>
            </div>

            {/* BTC Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Bitcoin (BTC) Deposit Config</h3>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">BTC Wallet Address</label>
                <input
                  type="text"
                  value={settings.btcAddress}
                  onChange={(e) => setSettings({ ...settings, btcAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono"
                  placeholder="bc1q..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">BTC Barcode QR Code Image URL (Optional)</label>
                <input
                  type="text"
                  value={settings.btcQrCode || ""}
                  onChange={(e) => setSettings({ ...settings, btcQrCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono"
                  placeholder="https://... or data:image/png;base64,..."
                />
              </div>
            </div>

            {/* ETH Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ethereum (ETH) Deposit Config</h3>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">ETH Wallet Address</label>
                <input
                  type="text"
                  value={settings.ethAddress || ""}
                  onChange={(e) => setSettings({ ...settings, ethAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono"
                  placeholder="0x..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">ETH Barcode QR Code Image URL (Optional)</label>
                <input
                  type="text"
                  value={settings.ethQrCode || ""}
                  onChange={(e) => setSettings({ ...settings, ethQrCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono"
                  placeholder="https://... or data:image/png;base64,..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Min Deposit ($)</label>
                <input
                  type="number"
                  value={settings.minDeposit}
                  onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Min Withdrawal ($)</label>
                <input
                  type="number"
                  value={settings.minWithdrawal}
                  onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Header Announcement Text</label>
              <input
                type="text"
                value={settings.announcement || ""}
                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500/20 border border-amber-500/40 text-amber-300 py-3 rounded-xl font-bold text-xs uppercase hover:bg-amber-500/30 transition cursor-pointer"
            >
              {isLoading ? "Saving..." : "Save Wallet & Barcode Configurations"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
