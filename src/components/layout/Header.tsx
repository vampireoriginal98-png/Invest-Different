import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Bell,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
  BarChart3,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Landmark,
  CandlestickChart,
  Shield,
  Dices,
  TrendingDown,
  Gift,
  Trophy,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "dashboard" },
  { icon: Wallet, label: "Deposit & Wallet", tab: "wallet" },
  { icon: ArrowUpRight, label: "Withdraw Funds", tab: "withdrawals" },
  { icon: TrendingUp, label: "Yield Investment Plans", tab: "investments" },
  { icon: Landmark, label: "Stock Portfolios", tab: "stocks" },
  { icon: CandlestickChart, label: "Trade Market Desk", tab: "broker" },
  { icon: Shield, label: "Insurance Aegis", tab: "insurance" },
  { icon: Dices, label: "Spin the Wheel", tab: "spin" },
  { icon: TrendingDown, label: "Predict Trend", tab: "predict" },
  { icon: Gift, label: "Daily Tasks", tab: "tasks" },
  { icon: Trophy, label: "Achievements", tab: "achievements" },
  { icon: ShieldCheck, label: "KYC Verification", tab: "kyc" },
  { icon: Users, label: "Referrals & Tree", tab: "referrals" },
  { icon: UserIcon, label: "Profile & Security", tab: "profile" },
];

export function Header() {
  const {
    user,
    logout,
    setCurrentTab,
    currentTab,
    unreadCount,
    systemSetting,
    theme,
    toggleTheme,
  } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 md:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setCurrentTab("dashboard")}
            className="flex items-center gap-2 cursor-pointer md:hidden"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gold-gradient">
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
            </div>
            <span className="font-extrabold text-amber-400 text-sm tracking-wide">
              Invest Different
            </span>
          </div>

          {systemSetting?.announcement && (
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="truncate max-w-sm">{systemSetting.announcement}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold">
              <span className="text-slate-400">Balance:</span>
              <span className="text-emerald-400">{formatCurrency(user.balance || 0)}</span>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:border-amber-500/40 hover:text-amber-400 transition cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setCurrentTab("notifications")}
            className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:border-amber-500/40 hover:text-white transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => setCurrentTab("profile")}
                className="flex items-center gap-2 text-left p-1 rounded-xl hover:bg-slate-900 transition cursor-pointer"
              >
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-extrabold text-xs">
                  {user.name?.charAt(0) || "I"}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-slate-200">{user.name || "Investor"}</p>
                  <p className="text-[10px] text-amber-400 font-semibold">{user.role}</p>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/95 border-b border-slate-800 p-6 pt-20 overflow-y-auto space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-white">{user?.name || "Investor"}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">{formatCurrency(user?.balance || 0)}</p>
            </div>
            <button
              onClick={() => {
                setCurrentTab("profile");
                setMobileOpen(false);
              }}
              className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg"
            >
              Profile
            </button>
          </div>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.tab}
                onClick={() => {
                  setCurrentTab(item.tab);
                  setMobileOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer ${
                  currentTab === item.tab
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-slate-400 hover:bg-slate-900"
                }`}
              >
                <item.icon className="w-4 h-4 text-amber-400" />
                <span>{item.label}</span>
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentTab("admin");
                  setMobileOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 mt-2"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Admin SuperControl</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
