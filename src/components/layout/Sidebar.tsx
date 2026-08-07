import React from "react";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  CandlestickChart,
  Landmark,
  Shield,
  Dices,
  TrendingDown,
  Gift,
  Trophy,
  ShieldCheck,
  Users,
  User,
  Zap,
  Info,
  FileText,
  MessageSquare,
  BarChart3,
  HelpCircle,
} from "lucide-react";

const MAIN_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "dashboard" },
  { icon: Wallet, label: "Deposit & Wallet", tab: "wallet" },
  { icon: ArrowUpRight, label: "Withdraw Funds", tab: "withdrawals" },
  { icon: TrendingUp, label: "Bot Yield Plans", tab: "investments" },
  { icon: Landmark, label: "Stock Portfolios", tab: "stocks" },
  { icon: CandlestickChart, label: "Trade Market", tab: "broker" },
  { icon: Shield, label: "Insurance Aegis", tab: "insurance" },
];

const GAMES_NAV = [
  { icon: Dices, label: "Spin the Wheel", tab: "spin" },
  { icon: TrendingDown, label: "Predict Trend", tab: "predict" },
  { icon: Gift, label: "Daily Tasks", tab: "tasks" },
  { icon: Trophy, label: "Achievements", tab: "achievements" },
];

const ACCOUNT_NAV = [
  { icon: ShieldCheck, label: "KYC Verification", tab: "kyc" },
  { icon: Users, label: "Referrals & Tree", tab: "referrals" },
  { icon: User, label: "Profile & Security", tab: "profile" },
];

const INSTITUTIONAL_NAV = [
  { icon: Info, label: "About Us", tab: "about" },
  { icon: FileText, label: "Blog & Insights", tab: "blog" },
  { icon: MessageSquare, label: "24/7 Desk Support", tab: "contact" },
  { icon: HelpCircle, label: "Terms & Legal", tab: "terms" },
];

export function Sidebar() {
  const { currentTab, setCurrentTab, user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-800/80 bg-slate-950 p-4 space-y-6 shrink-0 min-h-screen">
      {/* Brand Header */}
      <div
        onClick={() => setCurrentTab("dashboard")}
        className="flex items-center gap-3 px-2 cursor-pointer group"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
          <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
        </div>
        <div>
          <span className="text-base font-black tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            INVEST DIFFERENT
          </span>
          <span className="block text-[9px] font-bold text-amber-400 uppercase tracking-widest">
            Institutional Desk
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="space-y-6 flex-1 overflow-y-auto scrollbar-none pr-1">
        {/* Core Financial Products */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Core Capital
          </p>
          {MAIN_NAV.map((item) => (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentTab === item.tab
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <item.icon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Quant Games & Rewards */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Games & Rewards
          </p>
          {GAMES_NAV.map((item) => (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentTab === item.tab
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <item.icon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Account & Security */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Identity & Network
          </p>
          {ACCOUNT_NAV.map((item) => (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentTab === item.tab
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <item.icon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Institutional & Legal */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Institutional
          </p>
          {INSTITUTIONAL_NAV.map((item) => (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentTab === item.tab
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <item.icon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Admin SuperControl Button */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setCurrentTab("admin")}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                currentTab === "admin"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Admin SuperControl</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
